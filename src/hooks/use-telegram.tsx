// Хук для работы с Telegram Mini App
// Документация: https://core.telegram.org/bots/webapps

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    start_param?: string;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    onClick: (fn: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (fn: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const getTelegramWebApp = (): TelegramWebApp | null => {
  return window.Telegram?.WebApp ?? null;
};

export const getTelegramUser = (): TelegramUser | null => {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user ?? null;
};

// Форматируем Telegram ID в наш формат @id_123456789
export const formatTelegramId = (userId: number): string => {
  return `@id_${userId}`;
};

// Получаем отображаемое имя пользователя из Telegram
export const getTelegramDisplayName = (user: TelegramUser): string => {
  if (user.username) return user.username;
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.join(' ') || `User ${user.id}`;
};

// Проверяем, запущено ли приложение внутри Telegram
export const isInsideTelegram = (): boolean => {
  const tg = getTelegramWebApp();
  // Если есть initData или user — точно внутри Telegram
  if (tg?.initData && tg.initData.length > 0) return true;
  if (tg?.initDataUnsafe?.user) return true;
  // Проверяем платформу
  if (tg?.platform && tg.platform !== 'unknown') return true;
  return false;
};
