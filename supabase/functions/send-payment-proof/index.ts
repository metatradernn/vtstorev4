import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_BOT_TOKEN = '8732879647:AAGDmixVo2A88pL0Pr5TJW-QwgjxaCOBACs';

async function getLiveRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/RUB');
    const data = await res.json();
    if (data.result === 'success') return data.rates;
    throw new Error('bad response');
  } catch {
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/RUB');
      const data = await res.json();
      return data.rates || {};
    } catch {
      return { USD: 0.011, EUR: 0.010, UAH: 0.45, KZT: 4.8, BYN: 0.035, PLN: 0.044, GBP: 0.0087, TRY: 0.37 };
    }
  }
}

const METHOD_CURRENCY: Record<string, { currency: string; symbol: string }> = {
  'СБП':          { currency: 'RUB', symbol: '₽' },
  'Карты РФ':     { currency: 'RUB', symbol: '₽' },
  'Криптовалюта': { currency: 'USD', symbol: '$' },
  'Kaspi':        { currency: 'KZT', symbol: '₸' },
  'Приват Банк':  { currency: 'UAH', symbol: '₴' },
  'MonoBank':     { currency: 'UAH', symbol: '₴' },
  'Bank Polski':  { currency: 'PLN', symbol: 'zł' },
  'РБ':           { currency: 'BYN', symbol: 'Br' },
  'PayPal':       { currency: 'USD', symbol: '$' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ADMIN_CHAT_ID = Deno.env.get('TELEGRAM_ADMIN_CHAT_ID');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!ADMIN_CHAT_ID) {
      console.error("[send-payment-proof] TELEGRAM_ADMIN_CHAT_ID not set");
      return new Response(JSON.stringify({ error: 'Telegram не настроен' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const formData = await req.formData();
    const screenshot = formData.get('screenshot') as File;
    const productName = formData.get('productName') as string;
    const productId = formData.get('productId') as string;
    const rubAmount = Number(formData.get('rubAmount') as string);
    const country = formData.get('country') as string;
    const username = formData.get('username') as string;
    const telegramId = formData.get('telegramId') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const profileId = formData.get('profileId') as string;

    if (!screenshot) {
      return new Response(JSON.stringify({ error: 'Скриншот не прикреплён' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[send-payment-proof] Fetching live rates...");
    const rates = await getLiveRates();

    const methodInfo = METHOD_CURRENCY[paymentMethod];
    let clientAmountStr = `${rubAmount.toLocaleString('ru-RU')} ₽`;
    if (methodInfo && methodInfo.currency !== 'RUB') {
      const rate = rates[methodInfo.currency];
      if (rate) {
        const converted = Math.ceil(rubAmount * rate);
        clientAmountStr = `${converted.toLocaleString('ru-RU')} ${methodInfo.symbol}`;
      }
    }

    const kztRate = rates['KZT'] || 4.8;
    const kztAmount = Math.ceil(rubAmount * kztRate);

    // Создаём запись о покупке со статусом pending
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        profile_id: profileId,
        product_id: productId || productName.toLowerCase().replace(/\s+/g, '_'),
        product_name: productName,
        price: rubAmount,
        status: 'pending',
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (purchaseError || !purchase) {
      console.error("[send-payment-proof] Failed to create purchase:", purchaseError);
      return new Response(JSON.stringify({ error: 'Ошибка создания заявки' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[send-payment-proof] Purchase created:", purchase.id);

    const caption =
      `🧾 *НОВАЯ ЗАЯВКА НА ОПЛАТУ*\n\n` +
      `👤 Пользователь: *${username}*\n` +
      `📱 Telegram ID: \`${telegramId}\`\n` +
      `📦 Товар: *${productName}*\n` +
      `💳 Метод: *${paymentMethod}*${country ? ` (${country})` : ''}\n` +
      `🕐 Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}\n\n` +
      `💰 Клиент платит: *${clientAmountStr}*\n` +
      `💵 Для вас (в тенге): *${kztAmount.toLocaleString('ru-RU')} ₸*\n\n` +
      `🆔 ID заявки: \`${purchase.id}\``;

    // Inline кнопки для админа
    // ВАЖНО: callback_data не может превышать 64 байта!
    // UUID = 36 символов, поэтому используем только первые 8 символов ID (достаточно уникально)
    const shortId = purchase.id.replace(/-/g, '').substring(0, 16);
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ Одобрить', callback_data: `ok:${shortId}` },
          { text: '❌ Отклонить', callback_data: `no:${shortId}` },
        ],
        [
          { text: '🚫 Заблокировать профиль', callback_data: `bl:${shortId}` },
        ],
      ],
    };

    const adminIds = ADMIN_CHAT_ID.split(',').map(id => id.trim()).filter(Boolean);
    console.log("[send-payment-proof] Sending to admins:", adminIds);

    let firstMessageId: number | null = null;

    const results = await Promise.all(adminIds.map(async (chatId) => {
      const tgFormData = new FormData();
      tgFormData.append('chat_id', chatId);
      tgFormData.append('photo', screenshot, screenshot.name || 'screenshot.jpg');
      tgFormData.append('caption', caption);
      tgFormData.append('parse_mode', 'Markdown');
      tgFormData.append('reply_markup', JSON.stringify(inlineKeyboard));

      const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: tgFormData,
      });

      const tgData = await tgResponse.json();
      console.log(`[send-payment-proof] Telegram response for ${chatId}:`, { ok: tgData.ok, error: tgData.description });

      if (tgData.ok && !firstMessageId) {
        firstMessageId = tgData.result?.message_id;
      }

      return { chatId, ok: tgData.ok, error: tgData.description };
    }));

    // Сохраняем message_id для последующего редактирования
    if (firstMessageId) {
      await supabase.from('purchases').update({ telegram_message_id: firstMessageId }).eq('id', purchase.id);
    }

    const allFailed = results.every(r => !r.ok);
    if (allFailed) {
      // Удаляем заявку если не удалось отправить
      await supabase.from('purchases').delete().eq('id', purchase.id);
      return new Response(JSON.stringify({ error: `Ошибка Telegram: ${results[0]?.error}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, purchaseId: purchase.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("[send-payment-proof] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
