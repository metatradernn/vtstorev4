"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Sparkles, Headphones, Newspaper, User } from "lucide-react";
import ProductCard from '@/components/ProductCard';
import PaymentModal from '@/components/PaymentModal';
import InfoModal from '@/components/InfoModal';
import { useAuth } from '@/hooks/use-auth';

const products = [
  {
    id: 'jarvis-max',
    name: 'Jarvis Max',
    description: 'Голосовой помощник с встроенным искусственным интеллектом.',
    fullInfo: 'Голосовой помощник с встроенным искусственным интеллектом.\n\nПонимает контекст, отвечает осмысленно, работает как полноценный цифровой ассистент.\n\nПлюс расширенный редактор команд для глубокой кастомизации.',
    price: '6900',
    image: '/src/assets/jarvis-max.jpg',
    isComingSoon: false
  },
  {
    id: 'jarvis-pro',
    name: 'Jarvis Pro',
    description: 'Быстрый голосовой помощник с базой более 150 готовых команд.',
    fullInfo: 'Быстрый голосовой помощник с базой более 150 готовых команд.\n\nСоздавайте собственные сценарии через простой и удобный редактор.\n\nМаксимум скорости. Полный контроль.',
    price: '2380',
    image: '/src/assets/jarvis-pro.jpg',
    isComingSoon: false
  },
  {
    id: 'pc-control',
    name: 'PcControl',
    description: 'Полное управление компьютером через Telegram-бота.',
    fullInfo: 'Полное управление компьютером через Telegram-бота из любой точки мира.\n\nЗапуск программ, контроль процессов, доступ к системе — дистанционно и безопасно.',
    price: '1980',
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=800&auto=format&fit=crop',
    isComingSoon: false
  },
  {
    id: 'friday-pro',
    name: 'Friday Pro',
    description: 'Тот же функционал, что и у Jarvis Pro, но с женским голосом.',
    fullInfo: 'Тот же функционал, что и у Jarvis Pro, но с женским голосом.\n\nСтиль. Атмосфера. Характер.',
    price: '2380',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop',
    isComingSoon: false
  },
  {
    id: 'vibe-wall',
    name: 'VibeWall',
    description: 'Анимированные обои с интеграцией Jarvis.',
    fullInfo: 'Анимированные обои с интеграцией Jarvis.\n\nЖивой рабочий стол, который реагирует и работает вместе с вами.\n\nПолная синхронизация с вашим ассистентом и динамические визуальные эффекты.',
    price: '1200',
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop',
    isComingSoon: false
  },
  {
    id: 'friday-next-gen',
    name: 'FRIDAY',
    description: 'Новое поколение искусственного интеллекта. Скоро в продаже.',
    fullInfo: 'FRIDAY — это не просто помощник, это цифровая сущность.\n\nПолное погружение, улучшенная нейронная сеть и уникальный интерфейс взаимодействия.\n\nПродукт находится на стадии финального тестирования.',
    price: '0₽',
    image: '/src/assets/friday-bg.png',
    isComingSoon: true
  }
];

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const phoneContainerRef = React.useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handlePay = (productName: string) => {
    setSelectedProduct(productName);
    setIsPayModalOpen(true);
  };

  const handleInfo = (productName: string) => {
    setSelectedProduct(productName);
    setIsInfoModalOpen(true);
  };

  const currentProduct = products.find(p => p.name === selectedProduct) || null;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-0 sm:p-4 font-sans text-white">
      {/* iPad Frame */}
      <div
        ref={phoneContainerRef}
        className="relative w-full max-w-[1024px] h-screen sm:h-[768px] bg-black rounded-none sm:rounded-[40px] border-0 sm:border-[12px] border-zinc-900 overflow-hidden shadow-none sm:shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col"
      >
        
        {/* Header */}
        <header className="pt-10 pb-6 px-12 flex justify-between items-center bg-black/50 backdrop-blur-xl z-20">
          <div>
            <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Магазин</h1>
            <p className="text-xl font-black tracking-tighter uppercase italic">Vibe Technology</p>
          </div>
          <button
            className="w-10 h-10 rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-white/10 cursor-pointer active:scale-95 transition-transform bg-zinc-900 flex items-center justify-center"
            onClick={() => profile ? navigate('/profile') : navigate('/login')}
          >
            {profile ? (
              profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-black text-sm uppercase">{profile.username.charAt(0)}</span>
              )
            ) : (
              <User size={18} className="text-zinc-400" />
            )}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto relative px-12 pb-12 custom-scrollbar">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Рекомендуемые товары</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                image={product.image}
                isComingSoon={product.isComingSoon}
                onPay={() => handlePay(product.name)}
                onInfo={() => handleInfo(product.name)}
              />
            ))}
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="pb-10 pt-4 px-10 flex justify-between items-center border-t border-white/5 bg-black/80 backdrop-blur-xl z-20">
          <button
            onClick={() => window.open('https://t.me/vibetechhSupport?direct', '_blank')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 active:scale-90 transition-transform text-zinc-400 hover:text-white"
          >
            <Headphones size={20} />
          </button>
          <div className="w-12 h-1 bg-white/10 rounded-full"></div>
          <button
            onClick={() => window.open('https://t.me/VibeTechh', '_blank')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 active:scale-90 transition-transform text-zinc-400 hover:text-white"
          >
            <Newspaper size={20} />
          </button>
        </nav>
      </div>

      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        productName={selectedProduct || ""}
        productId={currentProduct?.id}
        productPrice={currentProduct ? parseInt(currentProduct.price) : 0}
        containerRef={phoneContainerRef}
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        product={currentProduct}
        containerRef={phoneContainerRef}
      />
    </div>
  );
};

export default Index;