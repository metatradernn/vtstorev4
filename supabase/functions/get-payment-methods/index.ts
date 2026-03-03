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
    const PLATEGA_SECRET = Deno.env.get('PLATEGA_SECRET');
    const PLATEGA_MERCHANT_ID = Deno.env.get('PLATEGA_MERCHANT_ID');

    if (!PLATEGA_SECRET || !PLATEGA_MERCHANT_ID) {
      return new Response(JSON.stringify({ error: 'Не настроены credentials' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Получаем все доступные методы
    const [methodsRes, merchantRes] = await Promise.all([
      fetch('https://api.platega.io/transaction/payment_methods', {
        headers: { 'X-MerchantId': PLATEGA_MERCHANT_ID, 'X-Secret': PLATEGA_SECRET },
      }),
      fetch(`https://api.platega.io/merchant/${PLATEGA_MERCHANT_ID}`, {
        headers: { 'X-MerchantId': PLATEGA_MERCHANT_ID, 'X-Secret': PLATEGA_SECRET },
      }),
    ]);

    const methodsData = await methodsRes.json();
    const merchantData = await merchantRes.json();

    console.log("[get-payment-methods] All methods:", JSON.stringify(methodsData));
    console.log("[get-payment-methods] Merchant data:", JSON.stringify(merchantData));

    return new Response(JSON.stringify({ methods: methodsData, merchant: merchantData }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("[get-payment-methods] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
