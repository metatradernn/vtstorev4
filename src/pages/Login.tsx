"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [telegramId, setTelegramId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!telegramId || !password) {
      setError('Заполните все поля');
      return;
    }
    if (mode === 'register' && !username) {
      setError('Введите имя пользователя');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = mode === 'login'
      ? await login(telegramId, password)
      : await register(telegramId, username, password);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/profile');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-0 sm:p-4 font-sans text-white">
      <div className="relative w-full max-w-[1024px] h-screen sm:h-[768px] bg-black rounded-none sm:rounded-[40px] border-0 sm:border-[12px] border-zinc-900 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]">

        {/* Header */}
        <header className="pt-10 pb-6 px-12 flex justify-between items-center bg-black/50 backdrop-blur-xl z-20">
          <div>
            <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Store</h1>
            <p className="text-xl font-black tracking-tighter uppercase italic">Vibe Technology</p>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center px-12 pb-12">
          <div className="w-full max-w-[480px] space-y-8">

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                {mode === 'login' ? 'Войти' : 'Создать\nАккаунт'}
              </h2>
              <p className="text-zinc-500 text-sm">
                {mode === 'login'
                  ? 'Введите ваш Telegram ID и пароль'
                  : 'Зарегистрируйтесь через Telegram ID'}
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 px-1">Telegram ID</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-lg">@</span>
                  <Input
                    placeholder="username"
                    value={telegramId.replace('@', '')}
                    onChange={(e) => setTelegramId(e.target.value)}
                    className="bg-zinc-900/50 border-white/5 h-16 rounded-2xl text-lg font-bold pl-10 focus:border-white/20 transition-all"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 px-1">Имя пользователя</label>
                  <Input
                    placeholder="Как вас зовут?"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-zinc-900/50 border-white/5 h-16 rounded-2xl text-lg font-bold focus:border-white/20 transition-all"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 px-1">Пароль</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="bg-zinc-900/50 border-white/5 h-16 rounded-2xl text-lg font-bold pr-14 focus:border-white/20 transition-all"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-16 bg-white text-black hover:bg-zinc-200 rounded-2xl text-lg font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center gap-3">
                    {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
                    <ArrowRight size={20} />
                  </span>
                )}
              </Button>
            </div>

            {/* Switch mode */}
            <div className="text-center">
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-zinc-500 hover:text-white transition-colors text-sm font-medium"
              >
                {mode === 'login'
                  ? 'Нет аккаунта? Зарегистрироваться'
                  : 'Уже есть аккаунт? Войти'}
              </button>
            </div>
          </div>
        </main>

        {/* Bottom nav placeholder */}
        <div className="h-20 border-t border-white/5 bg-black/80 backdrop-blur-xl" />
      </div>
    </div>
  );
};

export default Login;
