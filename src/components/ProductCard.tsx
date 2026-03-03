"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, CreditCard, ChevronRight } from "lucide-react";

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
  return (
    <Card className="w-full h-full flex flex-col border-none bg-zinc-900 text-white overflow-hidden shadow-2xl rounded-[48px]">
      <div className="relative flex-1 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className={cn(
            "w-full h-full object-cover transition-transform duration-500 hover:scale-105",
            isComingSoon && "opacity-50 grayscale"
          )}
        />
        {isComingSoon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Badge variant="outline" className="text-white border-white bg-black/50 px-4 py-2 text-lg font-bold tracking-widest backdrop-blur-md">
              СКОРО
            </Badge>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
          <h2 className="text-3xl font-black tracking-tighter uppercase">{name}</h2>
          <p className="text-zinc-400 text-sm mt-1">{description}</p>
        </div>
      </div>
      
      <CardContent className="p-6 pt-4 space-y-4 bg-zinc-900">
        <div className="flex items-baseline justify-between">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Starting at</span>
          <span className="text-2xl font-mono">{price}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="rounded-full border-zinc-700 bg-transparent text-white hover:bg-zinc-800"
            onClick={onInfo}
          >
            <Info className="w-4 h-4 mr-2" />
            Инфо
          </Button>
          <Button 
            className="rounded-full bg-white text-black hover:bg-zinc-200"
            onClick={onPay}
            disabled={isComingSoon}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Оплатить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

import { cn } from "@/lib/utils";
export default ProductCard;