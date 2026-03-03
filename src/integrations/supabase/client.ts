import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ldvlahtoiwimroycqcav.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdmxhaHRvaXdpbXJveWNxY2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDIwODksImV4cCI6MjA4ODExODA4OX0.DCM-xvruLo2Sho-6I_o87aa5OENCgxCfmyYptMk86BE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export type Profile = {
  id: string;
  telegram_id: string;
  username: string;
  balance: number;
  avatar_url: string | null;
  created_at: string;
  last_seen: string;
  is_blocked: boolean;
  block_reason: string | null;
};

export type Purchase = {
  id: string;
  profile_id: string;
  product_id: string;
  product_name: string;
  price: number;
  purchased_at: string;
  status: 'pending' | 'approved' | 'rejected';
  payment_method: string | null;
  screenshot_url: string | null;
  reviewed_at: string | null;
  telegram_message_id: number | null;
};
