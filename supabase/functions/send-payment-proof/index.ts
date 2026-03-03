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
    const productPrice = formData.get('productPrice') as string;
    const username = formData.get('username') as string;
    const telegramId = formData.get('telegramId') as string;
    const paymentMethod = formData.get('paymentMethod') as string;

    if (!screenshot) {
      return new Response(JSON.stringify({ error: 'Скриншот не прикреплён' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[send-payment-proof] Sending proof", { productName, username, telegramId, paymentMethod });

    const caption = `🛒 *НОВАЯ ЗАЯВКА НА ОПЛАТУ*\n\n` +
      `👤 Пользователь: *${username}*\n` +
      `📱 Telegram ID: \`${telegramId}\`\n` +
      `📦 Товар: *${productName}*\n` +
      `💰 Сумма: *${productPrice} ₽*\n` +
      `💳 Метод: *${paymentMethod}*\n` +
      `🕐 Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`;

    // Отправляем фото в Telegram
    const tgFormData = new FormData();
    tgFormData.append('chat_id', ADMIN_CHAT_ID);
    tgFormData.append('photo', screenshot, screenshot.name || 'screenshot.jpg');
    tgFormData.append('caption', caption);
    tgFormData.append('parse_mode', 'Markdown');

    const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: tgFormData,
    });

    const tgData = await tgResponse.json();
    console.log("[send-payment-proof] Telegram response", { ok: tgData.ok, error: tgData.description });

    if (!tgData.ok) {
      return new Response(JSON.stringify({ error: `Ошибка Telegram: ${tgData.description}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("[send-payment-proof] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
