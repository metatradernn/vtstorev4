"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, Calendar, Clock, ShoppingBag, User } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Profile = () => {
  const navigate = useNavigate();
  
  // Имитация данных пользователя
  const userData = {
    username: "Vibe User",
    telegramId: "@vibe_tech_user",
    registrationDate: "12.03.2024",
    daysInApp: 142,
    balance: "15,400 VB",
    purchasedProducts: [
      { id: 1, name: "Jarvis Pro", date: "15.03.2024" },
      { id: 2, name: "PcControl", date: "20.04.2024" }
    ]
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-0 sm:p-4 font-sans text-white">
      <div className="relative w-full max-w-[390px] h-screen sm:h-[844px] bg-black rounded-none sm:rounded-[60px] border-0 sm:border-[8px] border-zinc-900 overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="pt-14 pb-4 px-6 flex items-center gap-4 bg-black/50 backdrop-blur-xl z-20">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Профиль</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
          {/* User Avatar & Info */}
          <div className="flex flex-col items-center text-center space-y-4 pt-4">
            <div className="w-28 h-28 rounded-full border-2 border-white/10 p-1 relative">
              <img 
                src="/src/assets/avatar.jpg" 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
              />
              <div className="absolute bottom-0 right-0 bg-white text-black p-1.5 rounded-full shadow-lg">
                <User size={16} fill="black" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">{userData.username}</h2>
              <p className="text-zinc-500 font-mono text-sm">{userData.telegramId}</p>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Ваш Баланс</p>
              <h3 className="text-3xl font-black text-white">{userData.balance}</h3>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl">
              <Wallet className="text-white" size={28} />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/40 p-5 rounded-[28px] border border-white/5 space-y-2">
              <Calendar className="text-zinc-500" size={20} />
              <p className="text-[10px] uppercase text-zinc-500 font-bold">Регистрация</p>
              <p className="font-bold">{userData.registrationDate}</p>
            </div>
            <div className="bg-zinc-900/40 p-5 rounded-[28px] border border-white/5 space-y-2">
              <Clock className="text-zinc-500" size={20} />
              <p className="text-[10px] uppercase text-zinc-500 font-bold">В приложении</p>
              <p className="font-bold">{userData.daysInApp} дн.</p>
            </div>
          </div>

          {/* Purchased Items */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2 px-2">
              <ShoppingBag size={14} /> Мои покупки
            </h4>
            <div className="space-y-2">
              {userData.purchasedProducts.map((item) => (
                <div key={item.id} className="bg-zinc-900/30 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs text-zinc-500">{item.date}</span>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full h-14 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all mt-4">
            Настроить аккаунт
          </Button>
        </main>

        {/* Fake Nav Placeholder */}
        <div className="h-10"></div>
      </div>
    </div>
  );
};

export default Profile;