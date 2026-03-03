import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[get-exchange-rates] Fetching live rates from RUB");

    // Бесплатный API без ключа — актуальные курсы относительно RUB
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/RUB');
    const data = await response.json();

    if (!data.rates) {
      throw new Error('No rates in response');
    }

    console.log("[get-exchange-rates] Rates fetched successfully");

    return new Response(JSON.stringify({
      base: 'RUB',
      rates: {
        USD: data.rates.USD,
        EUR: data.rates.EUR,
        UAH: data.rates.UAH,
        KZT: data.rates.KZT,
        BYN: data.rates.BYN,
        PLN: data.rates.PLN,
        GBP: data.rates.GBP,
        TRY: data.rates.TRY,
        CNY: data.rates.CNY,
        USDT: data.rates.USD, // USDT ≈ USD
      },
      updated: data.date,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("[get-exchange-rates] Error:", error);
    // Fallback курсы если API недоступен
    return new Response(JSON.stringify({
      base: 'RUB',
      rates: { USD: 0.011, EUR: 0.010, UAH: 0.45, KZT: 4.8, BYN: 0.035, PLN: 0.044, GBP: 0.0087, TRY: 0.37, CNY: 0.079, USDT: 0.011 },
      updated: 'fallback',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
