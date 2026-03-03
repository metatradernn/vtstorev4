"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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

const CURRENCIES = [
  { id: 'RUB', label: 'Рубли',          symbol: '₽',  flag: '🇷🇺' },
  { id: 'KZT', label: 'Тенге',          symbol: '₸',  flag: '🇰🇿' },
  { id: 'UAH', label: 'Гривны',         symbol: '₴',  flag: '🇺🇦' },
  { id: 'BYN', label: 'Бел. Рубли',     symbol: 'Br', flag: '🇧🇾' },
  { id: 'USD', label: 'Доллары',        symbol: '$',  flag: '🇺🇸' },
  { id: 'EUR', label: 'Евро',           symbol: '€',  flag: '🇪🇺' },
  { id: 'PLN', label: 'Злотые',         symbol: 'zł', flag: '🇵🇱' },
  { id: 'GBP', label: 'Фунты',          symbol: '£',  flag: '🇬🇧' },
  { id: 'TRY', label: 'Лиры',           symbol: '₺',  flag: '🇹🇷' },
  { id: 'VB',  label: 'Vibe Coins',     symbol: 'VB', flag: '⚡' },
] as const;

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  description,
  price,
  image,
  isComingSoon,
  onPay,
  onInfo
}) => {
  const { convertPrice, getSymbol, setCurrency, currency, isLoadingRates, convertTo, ratesUpdatedAt } = useCurrency();
  const numericPrice = parseInt(price.replace(/[^\d]/g, '')) || 0;
  const currentCurrencyInfo = CURRENCIES.find(c => c.id === currency);

  return (
    <Card className="w-full h-full flex flex-col border-none bg-black text-white overflow-hidden rounded-[40px] shadow-2xl">
      {/* Top Image Section */}
      <div className="relative aspect-video overflow-hidden rounded-t-[40px] bg-zinc-900">
        <img 
          src={image} 
          alt={name} 
          className={cn(
            "w-full h-full object-cover transition-transform duration-700",
            isComingSoon && "opacity-40 grayscale"
          )}
        />
        <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent">
          <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">{name}</h2>
          <p className="text-zinc-300 text-xs font-medium max-w-[90%] leading-snug">
            {isComingSoon ? "Продукт скоро поступит в продажу." : description}
          </p>
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
          <div className="space-y-0.5">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] block">
              {isComingSoon ? "Статус" : "Цена от"}
            </span>
            {!isComingSoon && isLoadingRates && (
              <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                <Loader2 size={8} className="animate-spin" /> актуальный курс...
              </span>
            )}
            {!isComingSoon && !isLoadingRates && currentCurrencyInfo && (
              <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                {currentCurrencyInfo.flag} {currentCurrencyInfo.label} · live
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-3xl font-bold tracking-tight hover:text-zinc-400 transition-colors cursor-pointer outline-none flex items-center gap-2">
                {isComingSoon ? "TBA" : isLoadingRates ? (
                  <Loader2 size={24} className="animate-spin text-zinc-600" />
                ) : (
                  `${convertPrice(numericPrice)} ${getSymbol()}`
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-950 border-white/10 text-white p-2 rounded-2xl min-w-[200px] shadow-2xl">
              <DropdownMenuLabel className="text-[10px] text-zinc-600 uppercase tracking-widest px-3 py-2 flex items-center justify-between">
                <span>Выберите валюту</span>
                {!isLoadingRates && (
                  <span className="flex items-center gap-1 text-green-500 normal-case tracking-normal">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    актуальный курс
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5 mb-1" />
              {CURRENCIES.map((cur) => (
                <DropdownMenuItem
                  key={cur.id}
                  onClick={() => setCurrency(cur.id as any)}
                  className={cn(
                    "rounded-xl cursor-pointer p-3 flex items-center justify-between",
                    currency === cur.id ? "bg-white/10 text-white" : "hover:bg-white/5 text-zinc-300"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>{cur.flag}</span>
                    <span className="font-medium">{cur.label}</span>
                  </span>
                  <span className={cn("font-mono text-sm", currency === cur.id ? "text-white font-bold" : "text-zinc-500")}>
                    {numericPrice > 0 && cur.id !== 'VB'
                      ? `${convertTo(numericPrice, cur.id as any)} ${cur.symbol}`
                      : cur.symbol}
                  </span>
                </DropdownMenuItem>
              ))}
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