"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Sparkles, Headphones, Newspaper } from "lucide-react";
import ProductCard from '@/components/ProductCard';
import PaymentModal from '@/components/PaymentModal';
import { toast } from 'sonner';

const products = [
  {
    id: 'jarvis-max',
    name: 'Jarvis Max',
    description: 'Ultimate personal AI assistant with full hardware integration.',
    price: '6900₽',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
    isComingSoon: false
  },
  {
    id: 'jarvis-pro',
    name: 'Jarvis Pro',
    description: 'Advanced productivity suite for creative professionals.',
    price: '2380₽',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
    isComingSoon: false
  },
  {
    id: 'pc-control',
    name: 'PcControl',
    description: 'Seamless desktop automation and neural interface.',
    price: '1980₽',
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=800&auto=format&fit=crop',
    isComingSoon: false
  },
  {
    id: 'friday-pro',
    name: 'Friday Pro',
    description: 'The next evolution of contextual neural processing.',
    price: '2380₽',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop',
    isComingSoon: false
  }
];

const Index = () => {
  const navigate = useNavigate();
  const phoneContainerRef = React.useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const handlePay = (productName: string) => {
    setSelectedProduct(productName);
    setIsPayModalOpen(true);
  };

  const handleInfo = (productName: string) => {
    toast.info(`Информация о ${productName}`, {
      description: "Подробные характеристики будут доступны в следующем обновлении.",
      className: "bg-zinc-900 text-white border-zinc-800"
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-0 sm:p-4 font-sans text-white">
      {/* iPhone Frame */}
      <div
        ref={phoneContainerRef}
        className="relative w-full max-w-[390px] h-screen sm:h-[844px] bg-black rounded-none sm:rounded-[60px] border-0 sm:border-[8px] border-zinc-900 overflow-hidden shadow-none sm:shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col"
      >
        
        {/* Notch (only on desktop) */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-zinc-900 rounded-b-3xl z-50"></div>
        
        {/* Header */}
        <header className="pt-14 pb-4 px-8 flex justify-between items-center bg-black/50 backdrop-blur-xl z-20">
          <div>
            <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Store</h1>
            <p className="text-xl font-black tracking-tighter uppercase italic">Vibe Technology</p>
          </div>
          <div
            className="w-10 h-10 rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-white/10 cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/profile')}
          >
            <img
              src="/src/assets/avatar.jpg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0">
            <Carousel
              orientation="vertical"
              className="w-full h-full"
              opts={{ align: "start", loop: true, axis: "y" }}
            >
              <CarouselContent className="-mt-0 h-full">
                {products.map((product) => (
                  <CarouselItem key={product.id} className="pt-0 basis-full h-full">
                    <div className="w-full h-full p-2">
                      <ProductCard
                        name={product.name}
                        description={product.description}
                        price={product.price}
                        image={product.image}
                        isComingSoon={product.isComingSoon}
                        onPay={() => handlePay(product.name)}
                        onInfo={() => handleInfo(product.name)}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
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
        containerRef={phoneContainerRef}
      />
    </div>
  );
};

export default Index;