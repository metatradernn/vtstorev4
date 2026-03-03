import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Бот для добавления в группы
const INVITE_BOT_TOKEN = '8711776080:AAF9cKCKPSXIt4NE23T__fUp3pScN6wlj08';

// Маппинг product_id → chat_id группы
const PRODUCT_GROUPS: Record<string, { chatId: string; name: string }> = {
  'jarvis_max':  { chatId: '-1002564995824', name: 'Jarvis Max' },
  'jarvis_pro':  { chatId: '-1002035910246', name: 'Jarvis Pro' },
  'friday_pro':  { chatId: '-1001816037231', name: 'Friday Pro' },
  'vibewall':    { chatId: '-1002277771896', name: 'VibeWall' },
  'pccontrol':   { chatId: '-1002268406304', name: 'PcControl' },
};

// Также маппинг по названию продукта (на случай если product_id не совпадает)
const PRODUCT_NAME_MAP: Record<string, string> = {
  'jarvis max':  'jarvis_max',
  'jarvis pro':  'jarvis_pro',
  'friday pro':  'friday_pro',
  'vibewall':    'vibewall',
  'vibe wall':   'vibewall',
  'pccontrol':   'pccontrol',
  'pc control':  'pccontrol',
};

function resolveProductKey(productId: string, productName: string): string | null {
  // Сначала пробуем по product_id
  const byId = productId?.toLowerCase().replace(/\s+/g, '_');
  if (PRODUCT_GROUPS[byId]) return byId;

  // Потом по названию
  const byName = PRODUCT_NAME_MAP[productName?.toLowerCase()];
  if (byName) return byName;

  // Пробуем частичное совпадение по названию
  const nameLower = productName?.toLowerCase() || '';
  for (const [key, val] of Object.entries(PRODUCT_NAME_MAP)) {
    if (nameLower.includes(key) || key.includes(nameLower)) return val;
  }

  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { purchaseId } = await req.json();

    if (!purchaseId) {
      return new Response(JSON.stringify({ error: 'purchaseId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[invite-to-group] Processing purchaseId:", purchaseId);

    // Получаем данные о покупке и профиле
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*, profiles(telegram_id, username)')
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      console.error("[invite-to-group] Purchase not found:", purchaseError);
      return new Response(JSON.stringify({ error: 'Purchase not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const profile = purchase.profiles as { telegram_id: string; username: string } | null;
    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Получаем числовой Telegram user ID из telegram_id
    // Формат: @id_123456789 → 123456789
    const telegramIdStr = profile.telegram_id;
    let telegramUserId: number | null = null;

    if (telegramIdStr.startsWith('@id_')) {
      telegramUserId = parseInt(telegramIdStr.replace('@id_', ''), 10);
    } else if (telegramIdStr.startsWith('@')) {
      // username — нельзя добавить по username через API, нужен числовой ID
      console.warn("[invite-to-group] Cannot invite by username, need numeric ID:", telegramIdStr);
      return new Response(JSON.stringify({
        error: 'Невозможно добавить по username. Пользователь должен войти через Telegram Mini App.',
        invite_link: true,
      }), {
        status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!telegramUserId || isNaN(telegramUserId)) {
      return new Response(JSON.stringify({ error: 'Invalid Telegram user ID' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Определяем группу по продукту
    const productKey = resolveProductKey(purchase.product_id, purchase.product_name);
    if (!productKey) {
      console.error("[invite-to-group] Unknown product:", purchase.product_id, purchase.product_name);
      return new Response(JSON.stringify({ error: `Неизвестный продукт: ${purchase.product_name}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const group = PRODUCT_GROUPS[productKey];
    console.log("[invite-to-group] Inviting user", telegramUserId, "to group", group.name, group.chatId);

    // Добавляем пользователя в группу через unbanChatMember + addChatMember
    // Сначала разбаниваем (на случай если был забанен)
    await fetch(`https://api.telegram.org/bot${INVITE_BOT_TOKEN}/unbanChatMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: group.chatId,
        user_id: telegramUserId,
        only_if_banned: true,
      }),
    });

    // Добавляем в группу
    const addRes = await fetch(`https://api.telegram.org/bot${INVITE_BOT_TOKEN}/addChatMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: group.chatId,
        user_id: telegramUserId,
      }),
    });

    const addData = await addRes.json();
    console.log("[invite-to-group] addChatMember result:", addData);

    if (addData.ok) {
      // Успешно добавлен напрямую
      await supabase
        .from('purchases')
        .update({ invited_to_group: true, invited_at: new Date().toISOString() })
        .eq('id', purchaseId);

      return new Response(JSON.stringify({
        success: true,
        added_directly: true,
        group: group.name,
        message: `Вы добавлены в группу ${group.name}!`,
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Не удалось добавить напрямую — всегда создаём одноразовую invite link
    // Это работает даже если пользователь уже в группе (он просто перейдёт)
    console.warn("[invite-to-group] addChatMember failed:", addData.description, "— creating invite link");

    const linkRes = await fetch(`https://api.telegram.org/bot${INVITE_BOT_TOKEN}/createChatInviteLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: group.chatId,
        member_limit: 1,
        expire_date: Math.floor(Date.now() / 1000) + 86400, // 24 часа
      }),
    });

    const linkData = await linkRes.json();
    console.log("[invite-to-group] createChatInviteLink result:", linkData);

    if (linkData.ok) {
      // Сохраняем ссылку в БД, но НЕ ставим invited_to_group=true
      // пока пользователь реально не перешёл по ссылке
      await supabase
        .from('purchases')
        .update({ invite_link: linkData.result.invite_link })
        .eq('id', purchaseId);

      return new Response(JSON.stringify({
        success: true,
        added_directly: false,
        invite_link: linkData.result.invite_link,
        group: group.name,
        message: `Ссылка для вступления в ${group.name}`,
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      error: addData.description || 'Не удалось создать ссылку для группы',
    }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("[invite-to-group] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
