import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!PLATEGA_SECRET || !PLATEGA_MERCHANT_ID) {
      return new Response(JSON.stringify({ error: 'Платёжный сервис не настроен' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { transactionId, profileId, productName, productId, price } = await req.json();

    console.log("[check-payment] Checking transaction", { transactionId, profileId });

    const response = await fetch(`https://app.platega.io/transaction/${transactionId}`, {
      headers: {
        'X-MerchantId': PLATEGA_MERCHANT_ID,
        'X-Secret': PLATEGA_SECRET,
      },
    });

    const data = await response.json();
    console.log("[check-payment] Transaction status", { status: data.status });

    if (data.status === 'CONFIRMED') {
      // Записываем покупку в базу данных
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

      const { error: purchaseError } = await supabase.from('purchases').insert({
        profile_id: profileId,
        product_id: productId,
        product_name: productName,
        price: price,
      });

      if (purchaseError) {
        console.error("[check-payment] Error saving purchase:", purchaseError);
      } else {
        console.log("[check-payment] Purchase saved successfully");
      }
    }

    return new Response(JSON.stringify({ status: data.status }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("[check-payment] Error:", error);
    return new Response(JSON.stringify({ error: 'Внутренняя ошибка сервера' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
