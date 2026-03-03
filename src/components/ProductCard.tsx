"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductCardProps {
  name: string;
  description: string;
  price: string;
  image: string;
  isComingSoon?: boolean;
  onPay: () => void;
  onInfo: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  description,
  price,
  image,
  isComingSoon,
  onPay,
  onInfo
}) => {
  const { convertPrice, getSymbol, setCurrency } = useCurrency();
  const numericPrice = parseInt(price.replace(/[^\d]/g, '')) || 0;

  return (
    <Card className="w-full h-full flex flex-col border-none bg-black text-white overflow-hidden rounded-[40px] shadow-2xl">
      {/* Top Image Section with fixed aspect ratio */}
      <div className="relative aspect-video overflow-hidden rounded-t-[40px] bg-zinc-900">
        <img 
          src={image} 
          alt={name} 
          className={cn(
            "w-full h-full object-cover transition-transform duration-700",
            isComingSoon && "opacity-40 grayscale"
          )}
        />
        {/* Content Overlay on Image */}
        <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent">
          <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">{name}</h2>
          <p className="text-zinc-300 text-xs font-medium max-w-[90%] leading-snug">{description}</p>
        </div>
        
        {isComingSoon && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Badge variant="outline" className="text-white border-white/40 bg-white/10 px-6 py-2 text-xl font-bold tracking-widest backdrop-blur-xl rounded-full">
              СКОРО
            </Badge>
          </div>
        )}
      </div>
      
      {/* Bottom Info Section */}
      <div className="flex-1 p-8 flex flex-col justify-between bg-black">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            {isComingSoon ? "Status" : "Starting at"}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-3xl font-bold tracking-tight hover:text-zinc-400 transition-colors cursor-pointer outline-none">
                {isComingSoon ? "TBA" : `${convertPrice(numericPrice)} ${getSymbol()}`}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-900 border-white/10 text-white p-2 rounded-2xl min-w-[160px]">
              <DropdownMenuItem onClick={() => setCurrency('RUB')} className="rounded-xl hover:bg-white/10 cursor-pointer p-3">Рубли (₽)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrency('UAH')} className="rounded-xl hover:bg-white/10 cursor-pointer p-3">Гривны (₴)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrency('USD')} className="rounded-xl hover:bg-white/10 cursor-pointer p-3">Доллары ($)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrency('EUR')} className="rounded-xl hover:bg-white/10 cursor-pointer p-3">Евро (€)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrency('BYN')} className="rounded-xl hover:bg-white/10 cursor-pointer p-3">Бел. Рубли (Br)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrency('VB')} className="rounded-xl hover:bg-white/10 cursor-pointer p-3">Vibe Coins (VB)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button 
            variant="outline" 
            className="h-14 rounded-full border-zinc-800 bg-white/5 text-white hover:bg-white/10 text-base font-bold transition-all border-2"
            onClick={onInfo}
          >
            <Info className="w-5 h-5 mr-2" />
            Инфо
          </Button>
          <Button 
            className="h-14 rounded-full bg-white text-black hover:bg-zinc-200 text-base font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            onClick={onPay}
            disabled={isComingSoon}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Оплатить
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;