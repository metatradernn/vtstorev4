"use client";

import React, { useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans text-white">
      {/* iPhone Frame */}
      <div className="relative w-full max-w-[390px] h-[844px] bg-zinc-950 rounded-[60px] border-[8px] border-zinc-800 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col">
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-zinc-800 rounded-b-3xl z-50"></div>
        
        {/* Header */}
        <header className="pt-12 pb-6 px-8 flex justify-between items-center">
          <div>
            <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Store</h1>
            <p className="text-xl font-black tracking-tighter uppercase italic">Vibe Technology</p>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <Sparkles className="w-5 h-5 text-black" />
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
        <nav className="pb-10 pt-4 px-10 flex justify-between items-center border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-6 h-6 border-2 border-white rounded-md"></div>
          <div className="w-12 h-1 bg-zinc-700 rounded-full"></div>
          <div className="w-6 h-6 bg-white rounded-full"></div>
        </nav>
      </div>

      <PaymentModal 
        isOpen={isPayModalOpen} 
        onClose={() => setIsPayModalOpen(false)}
        productName={selectedProduct || ""}
      />
    </div>
  );
};

export default Index;