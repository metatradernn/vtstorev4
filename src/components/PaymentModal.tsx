"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, Landmark, Bitcoin, X, ExternalLink } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  containerRef?: React.RefObject<HTMLDivElement>;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, productName, containerRef }) => {
  const methods = [
    { 
      id: 'sbp', 
      name: 'Карта России (СБП)', 
      icon: <CreditCard className="w-4 h-4" />,
      infoUrl: 'https://telegra.ph/Oplata-Kaspi-10-31' // Общий пример для РФ или обновить если есть другой
    },
    { 
      id: 'kaspi', 
      name: 'Kaspi (Visa)', 
      icon: <Landmark className="w-4 h-4" />,
      infoUrl: 'https://telegra.ph/Oplata-Kaspi-10-31'
    },
    { 
      id: 'privat', 
      name: 'Приват Банк', 
      icon: <Landmark className="w-4 h-4" />,
      infoUrl: 'https://telegra.ph/Oplata-PrivatBank-10-31'
    },
    { 
      id: 'polski', 
      name: 'Bank Polski', 
      icon: <Landmark className="w-4 h-4" />,
      infoUrl: 'https://telegra.ph/Oplata-Bank-Polski-10-31'
    },
    { 
      id: 'rb', 
      name: 'Оплата с РБ', 
      icon: <CreditCard className="w-4 h-4" />,
      infoUrl: 'https://telegra.ph/Oplata-s-belarus-10-31'
    },
    { 
      id: 'paypal', 
      name: 'PayPal', 
      icon: <Wallet className="w-4 h-4" />,
      infoUrl: 'https://telegra.ph/Oplata-PayPal-10-31'
    },
    { 
      id: 'crypto', 
      name: 'Криптовалюта', 
      icon: <Bitcoin className="w-4 h-4" />,
      infoUrl: 'https://telegra.ph/Oplata-PayPal-10-31'
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal container={containerRef?.current}>
        <DialogOverlay className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
        <DialogContent
          className="absolute left-1/2 top-1/2 z-[101] w-[92%] -translate-x-1/2 -translate-y-1/2 gap-0 border border-zinc-800 bg-black p-6 shadow-2xl duration-200 rounded-[32px] outline-none"
        >
          <DialogHeader className="mb-6">
            <div className="flex justify-between items-start">
              <DialogTitle className="text-xl font-bold uppercase tracking-tight text-white">ОПЛАТА ЗАКАЗА</DialogTitle>
              <DialogPrimitive.Close className="text-zinc-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>
            <DialogDescription className="text-zinc-500 text-xs text-left mt-1">
              Выберите способ оплаты для {productName}
            </DialogDescription>
          </DialogHeader>

          <RadioGroup defaultValue="sbp" className="space-y-2 mb-8">
            {methods.map((method) => (
              <div key={method.id} className="relative flex items-center group">
                <RadioGroupItem
                  value={method.id}
                  id={method.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={method.id}
                  className="flex-1 flex items-center gap-3 p-4 rounded-2xl border border-transparent bg-zinc-900/50 hover:bg-zinc-800/80 peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-zinc-900 transition-all cursor-pointer"
                >
                  <span className="text-zinc-400">{method.icon}</span>
                  <span className="font-medium text-[14px] text-zinc-100">{method.name}</span>
                </Label>
                <button
                  onClick={() => window.open(method.infoUrl, '_blank')}
                  className="absolute right-4 p-2 rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 peer-data-[state=checked]:opacity-100"
                  title="Инструкция по оплате"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            ))}
          </RadioGroup>

          <Button className="w-full bg-white text-black hover:bg-zinc-200 rounded-2xl h-14 font-black uppercase text-sm tracking-widest transition-transform active:scale-95">
            ПРОДОЛЖИТЬ
          </Button>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default PaymentModal;