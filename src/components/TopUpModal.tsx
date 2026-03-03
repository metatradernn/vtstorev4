"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, CreditCard, Landmark, Globe } from 'lucide-react';
import { toast } from "sonner";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const paymentMethods = [
  {
    id: 'ua',
    title: 'Украина (Mono, АБанк, Пумб)',
    icon: <Landmark className="w-5 h-5" />,
    options: [
      { name: 'MonoBank', holder: 'Богдан Р.', card: '4441111066552765' },
      { name: 'АБанк', holder: 'Богдан Р.', card: '4323347363236206' },
      { name: 'Пумб', holder: 'Богдан Р.', card: '5355280043078623' },
    ]
  },
  {
    id: 'kz_rb',
    title: 'Kaspi и РБ',
    icon: <CreditCard className="w-5 h-5" />,
    options: [
      { name: 'Kaspi/РБ', holder: 'Фарида Л.', card: '4400 4303 0558 1131' }
    ]
  },
  {
    id: 'paypal',
    title: 'PayPal',
    icon: <Globe className="w-5 h-5" />,
    options: [
      { name: 'PayPal', holder: 'Global Pay', card: 'Dark_in@mail.ru' }
    ]
  }
];

const TopUpModal = ({ isOpen, onClose }: TopUpModalProps) => {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Реквизиты скопированы");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md rounded-[32px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase italic">Пополнение баланса</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Введите сумму и выберите способ оплаты для получения реквизитов.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest px-1">Сумма (VB)</label>
            <Input 
              type="number" 
              placeholder="Например: 1000" 
              className="bg-white/5 border-white/10 h-14 rounded-2xl text-lg font-bold"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest px-1">Способ оплаты</label>
            <div className="grid gap-2">
              {paymentMethods.map((method) => (
                <div key={method.id} className="space-y-2">
                  <button
                    onClick={() => setSelectedMethod(selectedMethod === method.id ? null : method.id)}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      selectedMethod === method.id 
                      ? 'bg-white text-black border-white' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {method.icon}
                      <span className="font-bold text-sm">{method.title}</span>
                    </div>
                  </button>
                  
                  {selectedMethod === method.id && (
                    <div className="grid gap-2 pl-2">
                      {method.options.map((opt, idx) => (
                        <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center group">
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold">{opt.name} — {opt.holder}</p>
                            <p className="font-mono text-sm tracking-wider">{opt.card}</p>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(opt.card)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                          >
                            <Copy size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            * После перевода средств по указанным реквизитам, баланс будет зачислен в течение 5-15 минут. Сохраняйте чек об оплате.
          </p>
        </div>

        <Button 
          onClick={onClose}
          className="w-full h-14 bg-white text-black font-black uppercase italic rounded-2xl hover:bg-zinc-200 mt-2"
        >
          Я оплатил
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TopUpModal;