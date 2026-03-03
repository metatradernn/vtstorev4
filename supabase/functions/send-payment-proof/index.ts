import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_BOT_TOKEN = '8732879647:AAGDmixVo2A88pL0Pr5TJW-QwgjxaCOBACs';

// Получаем актуальные курсы валют
async function getLiveRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/RUB');
    const data = await res.json();
    return data.rates || {};
  } catch {
    console.log("[send-payment-proof] Using fallback rates");
    return { USD: 0.011, EUR: 0.010, UAH: 0.45, KZT: 4.8, BYN: 0.035, PLN: 0.044, GBP: 0.0087, TRY: 0.37, CNY: 0.079 };
  }
}

// Маппинг метода оплаты на валюту
const METHOD_CURRENCY: Record<string, { currency: string; symbol: string; flag: string }> = {
  'СБП':          { currency: 'RUB', symbol: '₽',  flag: '🇷🇺' },
  'Карты РФ':     { currency: 'RUB', symbol: '₽',  flag: '🇷🇺' },
  'Криптовалюта': { currency: 'USD', symbol: '$',  flag: '🌍' },
  'Kaspi':        { currency: 'KZT', symbol: '₸',  flag: '🇰🇿' },
  'Приват Банк':  { currency: 'UAH', symbol: '₴',  flag: '🇺🇦' },
  'MonoBank':     { currency: 'UAH', symbol: '₴',  flag: '🇺🇦' },
  'Bank Polski':  { currency: 'PLN', symbol: 'zł', flag: '🇵🇱' },
  'РБ':           { currency: 'BYN', symbol: 'Br', flag: '🇧🇾' },
  'PayPal':       { currency: 'USD', symbol: '$',  flag: '🌍' },
};

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
    const rubAmount = Number(formData.get('rubAmount') as string);
    const country = formData.get('country') as string;
    const username = formData.get('username') as string;
    const telegramId = formData.get('telegramId') as string;
    const paymentMethod = formData.get('paymentMethod') as string;

    if (!screenshot) {
      return new Response(JSON.stringify({ error: 'Скриншот не прикреплён' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[send-payment-proof] Fetching live rates...");
    const rates = await getLiveRates();

    // Определяем валюту клиента по методу оплаты
    const methodInfo = METHOD_CURRENCY[paymentMethod];
    let clientAmountStr = `${rubAmount} ₽`;

    if (methodInfo && methodInfo.currency !== 'RUB') {
      const rate = rates[methodInfo.currency];
      if (rate) {
        const converted = Math.ceil(rubAmount * rate);
        clientAmountStr = `${converted.toLocaleString('ru-RU')} ${methodInfo.symbol}`;
      }
    }

    // Сумма в тенге для админа
    const kztRate = rates['KZT'] || 4.8;
    const kztAmount = Math.ceil(rubAmount * kztRate);
    const adminAmountStr = `${kztAmount.toLocaleString('ru-RU')} ₸`;

    console.log("[send-payment-proof] Sending proof", { productName, username, paymentMethod, clientAmountStr, adminAmountStr });

    const caption = `👤 Пользователь: *${username}*\n` +
      `📱 Telegram ID: \`${telegramId}\`\n` +
      `📦 Товар: *${productName}*\n` +
      `💳 Метод: *${paymentMethod}*${country ? ` (${country})` : ''}\n` +
      `🕐 Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}\n\n` +
      `💰 Клиент платит: *${clientAmountStr}*\n` +
      `💵 Для вас (в тенге): *${adminAmountStr}*`;

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
      return new Response(JSON.stringify({ error: `Ошибка Telegram: ${results[0]?.error}` }), {
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