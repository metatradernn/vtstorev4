import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cicssvbwmpylvejuoghh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY3NzdmJ3bXB5bHZlanVvZ2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1Mzg5NzAsImV4cCI6MjA4ODExNDk3MH0.g1cvFoJe_0R2QT9unl3RtvO0UfdxPHvWIvXj1ogQ5jg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export type Profile = {
  id: string;
  telegram_id: string;
  username: string;
  balance: number;
  avatar_url: string | null;
  created_at: string;
  last_seen: string;
};

export type Purchase = {
  id: string;
  profile_id: string;
  product_id: string;
  product_name: string;
  price: number;
  purchased_at: string;
};
