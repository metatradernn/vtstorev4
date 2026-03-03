"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, Landmark, Bitcoin } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, productName }) => {
  const methods = [
    { id: 'sbp', name: 'Карта России (СБП)', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'kaspi', name: 'Kaspi (Visa)', icon: <Landmark className="w-5 h-5" /> },
    { id: 'privat', name: 'Приват Банк', icon: <Landmark className="w-5 h-5" /> },
    { id: 'rb', name: 'Оплата с РБ (Kaspi Visa)', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'paypal', name: 'PayPal', icon: <Wallet className="w-5 h-5" /> },
    { id: 'crypto', name: 'Криптовалюта', icon: <Bitcoin className="w-5 h-5" /> },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-[90vw] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase tracking-tight">Оплата заказа</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Выберите способ оплаты для {productName}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup defaultValue="sbp" className="space-y-3 my-4">
          {methods.map((method) => (
            <div key={method.id} className="relative">
              <RadioGroupItem
                value={method.id}
                id={method.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={method.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 peer-data-[state=checked]:border-white peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400">{method.icon}</span>
                  <span className="font-medium">{method.name}</span>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Button className="w-full bg-white text-black hover:bg-zinc-200 rounded-2xl h-12 font-bold uppercase">
          Продолжить
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;