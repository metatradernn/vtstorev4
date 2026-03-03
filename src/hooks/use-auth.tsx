import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Profile } from '@/integrations/supabase/client';

interface AuthContextType {
  profile: Profile | null;
  isLoading: boolean;
  login: (telegramId: string, password: string) => Promise<{ error: string | null }>;
  register: (telegramId: string, username: string, password: string) => Promise<{ error: string | null }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Простое хеширование пароля (в продакшене использовать bcrypt)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'vibe_salt_2024');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('vibe_profile_id');
    if (stored) {
      loadProfile(stored);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadProfile = async (profileId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (data && !error) {
      setProfile(data as Profile);
      // Обновляем last_seen
      await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', profileId);
    } else {
      localStorage.removeItem('vibe_profile_id');
    }
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    if (!profile) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
    if (data) setProfile(data as Profile);
  };

  const login = async (telegramId: string, password: string): Promise<{ error: string | null }> => {
    const hash = await hashPassword(password);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('telegram_id', telegramId.startsWith('@') ? telegramId : `@${telegramId}`)
      .eq('password_hash', hash)
      .single();

    if (error || !data) {
      return { error: 'Неверный Telegram ID или пароль' };
    }

    setProfile(data as Profile);
    localStorage.setItem('vibe_profile_id', data.id);
    await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', data.id);
    return { error: null };
  };

  const register = async (telegramId: string, username: string, password: string): Promise<{ error: string | null }> => {
    const formattedId = telegramId.startsWith('@') ? telegramId : `@${telegramId}`;

    // Проверяем, не занят ли ID
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_id', formattedId)
      .single();

    if (existing) {
      return { error: 'Этот Telegram ID уже зарегистрирован' };
    }

    const hash = await hashPassword(password);
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        telegram_id: formattedId,
        username,
        password_hash: hash,
        balance: 0,
      })
      .select()
      .single();

    if (error || !data) {
      return { error: 'Ошибка при регистрации. Попробуйте снова.' };
    }

    setProfile(data as Profile);
    localStorage.setItem('vibe_profile_id', data.id);
    return { error: null };
  };

  const logout = () => {
    setProfile(null);
    localStorage.removeItem('vibe_profile_id');
  };

  return (
    <AuthContext.Provider value={{ profile, isLoading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
