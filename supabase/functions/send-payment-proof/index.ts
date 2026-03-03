import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_BOT_TOKEN = '8732879647:AAGDmixVo2A88pL0Pr5TJW-QwgjxaCOBACs';
// Получаем chat_id из переменной окружения (ваш личный Telegram ID)
// Установите TELEGRAM_ADMIN_CHAT_ID в Supabase Secrets

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ADMIN_CHAT_ID = Deno.env.get('TELEGRAM_ADMIN_CHAT_ID');

    if (!ADMIN_CHAT_ID) {
      console.error("[send-payment-proof] TELEGRAM_ADMIN_CHAT_ID not set");
      return new Response(JSON.stringify({ error: 'Telegram не настроен' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const screenshot = formData.get('screenshot') as File;
    const productName = formData.get('productName') as string;
    const productPrice = formData.get('productPrice') as string; // уже в нужной валюте
    const country = formData.get('country') as string;
    const username = formData.get('username') as string;
    const telegramId = formData.get('telegramId') as string;
    const paymentMethod = formData.get('paymentMethod') as string;

    if (!screenshot) {
      return new Response(JSON.stringify({ error: 'Скриншот не прикреплён' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[send-payment-proof] Sending proof", { productName, username, telegramId, paymentMethod });

    const caption = `👤 Пользователь: *${username}*\n` +
      `📱 Telegram ID: \`${telegramId}\`\n` +
      `📦 Товар: *${productName}*\n` +
      `💳 Метод: *${paymentMethod}*${country ? ` (${country})` : ''}\n` +
      `🕐 Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}\n\n` +
      `💰 Сумма: *${productPrice}*`;

    // Поддержка нескольких админов через запятую: "123456789,987654321"
    const adminIds = ADMIN_CHAT_ID.split(',').map(id => id.trim()).filter(Boolean);
    console.log("[send-payment-proof] Sending to admins:", adminIds);

    const results = await Promise.all(adminIds.map(async (chatId) => {
      const tgFormData = new FormData();
      tgFormData.append('chat_id', chatId);
      tgFormData.append('photo', screenshot, screenshot.name || 'screenshot.jpg');
      tgFormData.append('caption', caption);
      tgFormData.append('parse_mode', 'Markdown');

      const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: tgFormData,
      });

      const tgData = await tgResponse.json();
      console.log(`[send-payment-proof] Telegram response for ${chatId}:`, { ok: tgData.ok, error: tgData.description });
      return { chatId, ok: tgData.ok, error: tgData.description };
    }));

    const allFailed = results.every(r => !r.ok);
    if (allFailed) {
      const firstError = results[0]?.error || 'Ошибка отправки';
      return new Response(JSON.stringify({ error: `Ошибка Telegram: ${firstError}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, sent: results.filter(r => r.ok).length }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("[send-payment-proof] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});