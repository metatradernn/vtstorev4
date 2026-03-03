import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_BOT_TOKEN = '8732879647:AAGDmixVo2A88pL0Pr5TJW-QwgjxaCOBACs';

async function answerCallbackQuery(callbackQueryId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text, show_alert: false }),
  });
}

async function editMessageCaption(chatId: number, messageId: number, caption: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageCaption`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      caption,
      parse_mode: 'Markdown',
      reply_markup: JSON.stringify({ inline_keyboard: [] }),
    }),
  });
}

async function sendMessage(chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ADMIN_CHAT_ID = Deno.env.get('TELEGRAM_ADMIN_CHAT_ID') || '';

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    console.log("[telegram-webhook] Received update:", JSON.stringify(body));

    const callbackQuery = body.callback_query;
    if (!callbackQuery) {
      return new Response('ok', { status: 200 });
    }

    const callbackQueryId = callbackQuery.id;
    const data = callbackQuery.data as string;
    const fromChatId = callbackQuery.message?.chat?.id;
    const messageId = callbackQuery.message?.message_id;
    const adminUsername = callbackQuery.from?.username || callbackQuery.from?.first_name || 'Админ';

    // Проверяем что нажал именно админ
    const adminIds = ADMIN_CHAT_ID.split(',').map(id => id.trim());
    if (!adminIds.includes(String(fromChatId))) {
      console.warn("[telegram-webhook] Unauthorized callback from:", fromChatId);
      await answerCallbackQuery(callbackQueryId, '⛔ Нет доступа');
      return new Response('ok', { status: 200 });
    }

    const parts = data.split(':');
    const action = parts[0];
    const purchaseId = parts[1];
    const profileId = parts[2]; // только для block

    console.log("[telegram-webhook] Action:", action, "purchaseId:", purchaseId);

    // Получаем данные о покупке
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*, profiles(username, telegram_id)')
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      console.error("[telegram-webhook] Purchase not found:", purchaseError);
      await answerCallbackQuery(callbackQueryId, '❌ Заявка не найдена');
      return new Response('ok', { status: 200 });
    }

    const now = new Date().toISOString();
    const profile = purchase.profiles as { username: string; telegram_id: string } | null;
    const userName = profile?.username || 'Пользователь';
    const userTelegramId = profile?.telegram_id || '';

    if (action === 'approve') {
      // Одобряем покупку
      await supabase
        .from('purchases')
        .update({ status: 'approved', reviewed_at: now })
        .eq('id', purchaseId);

      await answerCallbackQuery(callbackQueryId, '✅ Покупка одобрена!');

      // Редактируем сообщение в Telegram
      if (fromChatId && messageId) {
        await editMessageCaption(
          fromChatId,
          messageId,
          `✅ *ОДОБРЕНО* — @${adminUsername}\n\n` +
          `👤 Пользователь: *${userName}*\n` +
          `📦 Товар: *${purchase.product_name}*\n` +
          `💰 Сумма: *${purchase.price} ₽*\n` +
          `🕐 Рассмотрено: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`
        );
      }

      // Уведомляем второго админа
      for (const adminId of adminIds) {
        if (String(adminId) !== String(fromChatId)) {
          await sendMessage(adminId, `✅ Заявка *${purchase.product_name}* для *${userName}* одобрена @${adminUsername}`);
        }
      }

      console.log("[telegram-webhook] Purchase approved:", purchaseId);

    } else if (action === 'reject') {
      // Отклоняем покупку
      await supabase
        .from('purchases')
        .update({ status: 'rejected', reviewed_at: now })
        .eq('id', purchaseId);

      await answerCallbackQuery(callbackQueryId, '❌ Покупка отклонена');

      if (fromChatId && messageId) {
        await editMessageCaption(
          fromChatId,
          messageId,
          `❌ *ОТКЛОНЕНО* — @${adminUsername}\n\n` +
          `👤 Пользователь: *${userName}*\n` +
          `📦 Товар: *${purchase.product_name}*\n` +
          `💰 Сумма: *${purchase.price} ₽*\n` +
          `🕐 Рассмотрено: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`
        );
      }

      for (const adminId of adminIds) {
        if (String(adminId) !== String(fromChatId)) {
          await sendMessage(adminId, `❌ Заявка *${purchase.product_name}* для *${userName}* отклонена @${adminUsername}`);
        }
      }

      console.log("[telegram-webhook] Purchase rejected:", purchaseId);

    } else if (action === 'block') {
      const blockProfileId = profileId || purchase.profile_id;

      // Блокируем профиль
      await supabase
        .from('profiles')
        .update({ is_blocked: true, block_reason: `Заблокирован администратором @${adminUsername}` })
        .eq('id', blockProfileId);

      // Также отклоняем заявку
      await supabase
        .from('purchases')
        .update({ status: 'rejected', reviewed_at: now })
        .eq('id', purchaseId);

      await answerCallbackQuery(callbackQueryId, '🚫 Профиль заблокирован!');

      if (fromChatId && messageId) {
        await editMessageCaption(
          fromChatId,
          messageId,
          `🚫 *ЗАБЛОКИРОВАН* — @${adminUsername}\n\n` +
          `👤 Пользователь: *${userName}*\n` +
          `📱 Telegram ID: \`${userTelegramId}\`\n` +
          `📦 Товар: *${purchase.product_name}*\n` +
          `🕐 Заблокирован: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`
        );
      }

      for (const adminId of adminIds) {
        if (String(adminId) !== String(fromChatId)) {
          await sendMessage(adminId, `🚫 Профиль *${userName}* (${userTelegramId}) заблокирован @${adminUsername}`);
        }
      }

      console.log("[telegram-webhook] Profile blocked:", blockProfileId);
    }

    return new Response('ok', { status: 200 });

  } catch (error) {
    console.error("[telegram-webhook] Error:", error);
    return new Response('ok', { status: 200 }); // Telegram требует 200 даже при ошибке
  }
});
