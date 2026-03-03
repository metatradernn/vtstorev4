import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Profile } from '@/integrations/supabase/client';
import {
  getTelegramUser,
  getTelegramWebApp,
  formatTelegramId,
  getTelegramDisplayName,
  isInsideTelegram,
  type TelegramUser,
} from '@/hooks/use-telegram';

interface AuthContextType {
  profile: Profile | null;
  isLoading: boolean;
  login: (telegramId: string, password: string) => Promise<{ error: string | null }>;
  register: (telegramId: string, username: string, password: string) => Promise<{ error: string | null }>;
  registerWithTelegram: (tgUser: TelegramUser, password: string) => Promise<{ error: string | null }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    const init = async () => {
      // Сначала пробуем восстановить сессию из localStorage
      const stored = localStorage.getItem('vibe_profile_id');
      if (stored) {
        await loadProfile(stored);
        return;
      }

      // Если внутри Telegram — пробуем автоматически найти профиль
      const tg = getTelegramWebApp();
      if (tg) tg.ready();

      const tgUser = getTelegramUser();
      if (tgUser && isInsideTelegram()) {
        const telegramId = formatTelegramId(tgUser.id);
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_id', telegramId)
          .single();

        if (data) {
          // Профиль найден — но всё равно нужен пароль, не логиним автоматически
          // Просто сохраняем что пользователь существует (для UX на Login странице)
          // Реальный вход только через login()
        }
      }

      setIsLoading(false);
    };

    init();
  }, []);

  const loadProfile = async (profileId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (data && !error) {
      // Проверяем блокировку
      if ((data as Profile).is_blocked) {
        setProfile(data as Profile); // показываем экран блокировки
      } else {
        setProfile(data as Profile);
      }
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
    const formattedId = telegramId.startsWith('@') ? telegramId : `@${telegramId}`;
    const hash = await hashPassword(password);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('telegram_id', formattedId)
      .eq('password_hash', hash)
      .single();

    if (error || !data) {
      // Проверяем — может профиль существует, но пароль неверный
      const { data: exists } = await supabase
        .from('profiles')
        .select('id')
        .eq('telegram_id', formattedId)
        .single();

      if (!exists) {
        return { error: 'Аккаунт не найден. Создайте новый.' };
      }
      return { error: 'Неверный пароль' };
    }

    if ((data as Profile).is_blocked) {
      return { error: '🚫 Ваш профиль заблокирован. Обратитесь в поддержку.' };
    }

    setProfile(data as Profile);
    localStorage.setItem('vibe_profile_id', data.id);
    await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', data.id);
    return { error: null };
  };

  // Регистрация через Telegram WebApp — ID и имя берём из Telegram
  const registerWithTelegram = async (tgUser: TelegramUser, password: string): Promise<{ error: string | null }> => {
    const telegramId = formatTelegramId(tgUser.id);
    const username = getTelegramDisplayName(tgUser);

    // Проверяем, не занят ли ID
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_id', telegramId)
      .single();

    if (existing) {
      return { error: 'Аккаунт с этим Telegram ID уже существует. Войдите с паролем.' };
    }

    const hash = await hashPassword(password);

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        telegram_id: telegramId,
        username,
        password_hash: hash,
        balance: 0,
        avatar_url: tgUser.photo_url || null,
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

  // Ручная регистрация (для браузера/дев режима)
  const register = async (telegramId: string, username: string, password: string): Promise<{ error: string | null }> => {
    const formattedId = telegramId.startsWith('@') ? telegramId : `@${telegramId}`;

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
    <AuthContext.Provider value={{ profile, isLoading, login, register, registerWithTelegram, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
