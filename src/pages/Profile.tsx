"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, Calendar, Clock, ShoppingBag, User, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useCurrency } from '@/hooks/use-currency';
import TopUpModal from '@/components/TopUpModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Profile = () => {
  const navigate = useNavigate();
  const { currency, setCurrency, convertPrice, getSymbol } = useCurrency();
  const [isTopUpOpen, setIsTopUpOpen] = React.useState(false);
  
  const userData = {
    username: "Vibe User",
    telegramId: "@vibe_tech_user",
    registrationDate: "12.03.2024",
    daysInApp: 142,
    balanceVB: 0, // Баланс теперь 0
    purchasedProducts: [
      { id: 1, name: "Jarvis Pro", date: "15.03.2024" },
      { id: 2, name: "PcControl", date: "20.04.2024" }
    ]
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-0 sm:p-4 font-sans text-white">
      <div className="relative w-full max-w-[1024px] h-screen sm:h-[768px] bg-black rounded-none sm:rounded-[40px] border-0 sm:border-[12px] border-zinc-900 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        
        <header className="pt-10 pb-6 px-12 flex items-center gap-6 bg-black/50 backdrop-blur-xl z-20">
          <button onClick={() => navigate('/')} className="p-3 hover:bg-white/10 rounded-full transition-colors border border-white/5">
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-2xl font-bold">Управление профилем</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-12 py-8 space-y-10 custom-scrollbar">
          <div className="flex items-center gap-8 pt-4">
            <div className="w-32 h-32 rounded-full border-2 border-white/10 p-1 relative flex-shrink-0">
              <img
                src="/src/assets/avatar.jpg"
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
              <div className="absolute bottom-1 right-1 bg-white text-black p-2 rounded-full shadow-lg">
                <User size={18} fill="black" />
              </div>
            </div>
            <div className="text-left">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">{userData.username}</h2>
              <p className="text-zinc-500 font-mono text-lg">{userData.telegramId}</p>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <Calendar size={14} className="text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{userData.registrationDate}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <Clock size={14} className="text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{userData.daysInApp} ДНЕЙ</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Balance Card with Currency Switcher */}
            <div className="space-y-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full text-left bg-zinc-900/50 border border-white/5 rounded-[32px] p-8 flex items-center justify-between hover:bg-zinc-900/80 transition-colors group">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">Ваш Баланс</p>
                      <h3 className="text-5xl font-black text-white">
                        {convertPrice(userData.balanceVB)} {getSymbol()}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-white transition-colors">
                        <span>Сменить валюту</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                    <div className="bg-white/10 p-6 rounded-3xl group-hover:rotate-12 transition-transform">
                      <Wallet className="text-white" size={32} />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-900 border-white/10 text-white w-[240px] p-2">
                  <DropdownMenuItem onClick={() => setCurrency('VB')} className="rounded-xl hover:bg-white/10 cursor-pointer p-3">Vibe Coins (VB)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrency('RUB')} className="rounded-xl hover:bg-white/10 cursor-pointer p-3">Рубли (₽)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrency('USD')} className="rounded-xl hover:bg-white/10 cursor-pointer p-3">Доллары ($)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => setIsTopUpOpen(true)}
                className="w-full h-20 bg-white text-black hover:bg-zinc-200 rounded-[28px] text-xl font-bold transition-all shadow-xl"
              >
                Пополнить баланс
              </Button>
            </div>

            {/* Purchases List */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-3 px-2">
                <ShoppingBag size={18} /> Мои покупки
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {userData.purchasedProducts.map((item) => (
                  <div key={item.id} className="bg-zinc-900/40 p-5 rounded-3xl flex justify-between items-center border border-white/5 hover:bg-zinc-900/60 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">{item.name}</span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Лицензия активна</span>
                    </div>
                    <span className="text-sm font-mono text-zinc-500 bg-black/40 px-3 py-1 rounded-lg">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button className="h-16 px-12 rounded-[24px] bg-zinc-900 text-white border border-white/10 font-bold hover:bg-white hover:text-black transition-all">
              Настройки аккаунта
            </Button>
          </div>
        </main>

        <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />

        <div className="h-10"></div>
      </div>
    </div>
  );
};

export default Profile;