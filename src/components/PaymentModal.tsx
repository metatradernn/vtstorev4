"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, Landmark, Bitcoin, X, ExternalLink, Loader2, CheckCircle, Copy, Smartphone } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId?: string;
  productPrice?: number;
  containerRef?: React.RefObject<HTMLDivElement>;
}

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdmxhaHRvaXdpbXJveWNxY2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDIwODksImV4cCI6MjA4ODExODA4OX0.DCM-xvruLo2Sho-6I_o87aa5OENCgxCfmyYptMk86BE';
const SUPABASE_FN = 'https://ldvlahtoiwimroycqcav.supabase.co/functions/v1';

// Методы через Platega (автоматические)
const PLATEGA_METHODS = [
  { id: 'sbp',      name: 'СБП (Россия)',        icon: <Smartphone className="w-4 h-4" />, badge: 'Быстро' },
  { id: 'cards_ru', name: 'Карты РФ (Мир/Visa)', icon: <CreditCard className="w-4 h-4" />, badge: null },
  { id: 'crypto',   name: 'Криптовалюта',         icon: <Bitcoin className="w-4 h-4" />,    badge: 'Авто' },
];

// Методы с ручными реквизитами
const MANUAL_METHODS = [
  {
    id: 'kaspi', name: 'Kaspi (Visa)', icon: <Landmark className="w-4 h-4" />,
    infoUrl: 'https://telegra.ph/Oplata-Kaspi-10-31',
    requisites: [{ label: 'Kaspi / РБ — Фарида Л.', value: '4400 4303 0558 1131' }],
  },
  {
    id: 'privat', name: 'Приват Банк', icon: <Landmark className="w-4 h-4" />,
    infoUrl: 'https://telegra.ph/Oplata-PrivatBank-10-31',
    requisites: [{ label: 'Приват Банк — Богдан Р.', value: '4441111066552765' }],
  },
  {
    id: 'mono', name: 'MonoBank', icon: <CreditCard className="w-4 h-4" />,
    infoUrl: 'https://telegra.ph/Oplata-PrivatBank-10-31',
    requisites: [{ label: 'MonoBank — Богдан Р.', value: '4441111066552765' }],
  },
  {
    id: 'polski', name: 'Bank Polski', icon: <Landmark className="w-4 h-4" />,
    infoUrl: 'https://telegra.ph/Oplata-Bank-Polski-10-31',
    requisites: [{ label: 'Bank Polski — Богдан Р.', value: '4323347363236206' }],
  },
  {
    id: 'rb', name: 'Оплата с РБ', icon: <CreditCard className="w-4 h-4" />,
    infoUrl: 'https://telegra.ph/Oplata-s-belarus-10-31',
    requisites: [{ label: 'Kaspi Visa — Фарида Л.', value: '4400 4303 0558 1131' }],
  },
  {
    id: 'paypal', name: 'PayPal', icon: <Wallet className="w-4 h-4" />,
    infoUrl: 'https://telegra.ph/Oplata-PayPal-10-31',
    requisites: [{ label: 'PayPal Email', value: 'Dark_in@mail.ru' }],
  },
];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, productName, productId, productPrice, containerRef }) => {
  const { profile } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showRequisites, setShowRequisites] = useState(false);

  const selectedManual = MANUAL_METHODS.find(m => m.id === selectedMethod);
  const isPlatega = PLATEGA_METHODS.some(m => m.id === selectedMethod);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Скопировано!');
  };

  const callPlatega = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(`${SUPABASE_FN}/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({
          amount: productPrice || 0,
          productName,
          profileId: profile!.id,
          currency: 'RUB',
          paymentMethodId: selectedMethod,
        }),
      });
      const data = await response.json();
      if (!response.ok || data?.error) {
        setErrorMsg(data?.error || 'Ошибка создания платежа. Метод может быть недоступен.');
      } else {
        setPaymentUrl(data.redirect);
        setTransactionId(data.transactionId);
        setStatus('pending');
        window.open(data.redirect, '_blank');
      }
    } catch {
      setErrorMsg('Ошибка соединения с платёжным сервисом');
    }
    setIsLoading(false);
  };

  const handlePay = async () => {
    if (!selectedMethod) { setErrorMsg('Выберите способ оплаты'); return; }
    if (!profile) { setErrorMsg('Необходимо войти в аккаунт'); return; }
    setErrorMsg('');
    if (selectedManual) { setShowRequisites(true); return; }
    if (isPlatega) await callPlatega();
  };

  const handleCheckStatus = async () => {
    if (!transactionId || !profile) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${SUPABASE_FN}/check-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ transactionId, profileId: profile.id, productName, productId: productId || '', price: productPrice || 0 }),
      });
      const data = await response.json();
      if (data?.status === 'CONFIRMED') setStatus('success');
      else if (data?.status === 'CANCELED') { setStatus('error'); setErrorMsg('Платёж отменён'); }
      else setErrorMsg('Платёж ещё не подтверждён. Попробуйте через минуту.');
    } catch { setErrorMsg('Ошибка проверки статуса'); }
    setIsLoading(false);
  };

  const handleClose = () => {
    setSelectedMethod(null); setPaymentUrl(null); setTransactionId(null);
    setStatus('idle'); setErrorMsg(''); setShowRequisites(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogPortal container={containerRef?.current}>
        <DialogOverlay className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="absolute left-1/2 top-1/2 z-[101] w-[92%] max-w-[480px] -translate-x-1/2 -translate-y-1/2 border border-zinc-800 bg-black p-6 shadow-2xl rounded-[32px] outline-none max-h-[85vh] overflow-y-auto">

          <DialogHeader className="mb-5">
            <div className="flex justify-between items-start">
              <DialogTitle className="text-xl font-bold uppercase tracking-tight text-white">
                {status === 'success' ? '✅ Оплата прошла!' : showRequisites ? 'Реквизиты' : 'ОПЛАТА ЗАКАЗА'}
              </DialogTitle>
              <button onClick={handleClose} className="text-zinc-500 hover:text-white transition-colors flex-shrink-0 ml-4">
                <X className="h-5 w-5" />
              </button>
            </div>
            <DialogDescription className="text-zinc-500 text-xs text-left mt-1">
              {status === 'success' ? `${productName} добавлен в ваши покупки` : `«${productName}» — ${productPrice} ₽`}
            </DialogDescription>
          </DialogHeader>

          {/* Успех */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-6 py-4">
              <CheckCircle className="text-white" size={56} />
              <p className="text-zinc-400 text-center text-sm">Покупка успешно завершена и добавлена в ваш профиль.</p>
              <Button onClick={handleClose} className="w-full h-14 bg-white text-black font-black uppercase rounded-2xl">Закрыть</Button>
            </div>
          )}

          {/* Ожидание Platega */}
          {status === 'pending' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5 text-center space-y-2">
                <p className="text-zinc-300 text-sm font-medium">Страница оплаты открыта в новой вкладке.</p>
                <p className="text-zinc-500 text-xs">После оплаты нажмите кнопку ниже.</p>
              </div>
              {errorMsg && <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4"><p className="text-red-400 text-sm">{errorMsg}</p></div>}
              <Button onClick={handleCheckStatus} disabled={isLoading} className="w-full h-14 bg-white text-black font-black uppercase rounded-2xl hover:bg-zinc-200">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Я оплатил — проверить'}
              </Button>
              <button onClick={() => paymentUrl && window.open(paymentUrl, '_blank')} className="w-full text-center text-zinc-500 hover:text-white text-sm transition-colors py-2">
                Открыть страницу оплаты снова
              </button>
            </div>
          )}

          {/* Ручные реквизиты */}
          {showRequisites && selectedManual && status === 'idle' && (
            <div className="space-y-4">
              {selectedManual.requisites.map((req, i) => (
                <div key={i} className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{req.label}</p>
                    <p className="font-mono text-base tracking-wider text-white mt-1">{req.value}</p>
                  </div>
                  <button onClick={() => copyToClipboard(req.value)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors ml-3">
                    <Copy size={16} />
                  </button>
                </div>
              ))}
              <div className="bg-zinc-900/30 p-4 rounded-2xl border border-white/5">
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Переведите <span className="text-white font-bold">{productPrice} ₽</span> по реквизитам выше и укажите в комментарии название товара. Баланс будет зачислен в течение 5–15 минут.
                </p>
              </div>
              <button onClick={() => window.open(selectedManual.infoUrl, '_blank')} className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors py-2">
                <ExternalLink size={14} /> Инструкция по оплате
              </button>
              <Button onClick={handleClose} className="w-full h-14 bg-white text-black font-black uppercase rounded-2xl hover:bg-zinc-200">
                Я оплатил
              </Button>
            </div>
          )}

          {/* Выбор метода */}
          {!showRequisites && status === 'idle' && (
            <div className="space-y-4">
              {/* Россия — через Platega */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-2 px-1">🇷🇺 Россия (автооплата)</p>
                <div className="space-y-2">
                  {PLATEGA_METHODS.map((method) => (
                    <div key={method.id} onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center rounded-2xl border transition-all cursor-pointer ${selectedMethod === method.id ? 'border-white bg-zinc-900' : 'border-transparent bg-zinc-900/50 hover:bg-zinc-800/80'}`}>
                      <div className="flex-1 flex items-center gap-3 p-4">
                        <span className="text-zinc-400">{method.icon}</span>
                        <span className="font-medium text-[14px] text-zinc-100">{method.name}</span>
                        {method.badge && <span className="text-[10px] bg-white/10 text-zinc-400 px-2 py-0.5 rounded-full">{method.badge}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Другие страны — ручные реквизиты */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-2 px-1">🌍 Другие страны (реквизиты)</p>
                <div className="space-y-2">
                  {MANUAL_METHODS.map((method) => (
                    <div key={method.id} onClick={() => setSelectedMethod(method.id)}
                      className={`relative flex items-center rounded-2xl border transition-all cursor-pointer ${selectedMethod === method.id ? 'border-white bg-zinc-900' : 'border-transparent bg-zinc-900/50 hover:bg-zinc-800/80'}`}>
                      <div className="flex-1 flex items-center gap-3 p-4">
                        <span className="text-zinc-400">{method.icon}</span>
                        <span className="font-medium text-[14px] text-zinc-100">{method.name}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); window.open(method.infoUrl, '_blank'); }}
                        className="p-3 mr-2 rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all" title="Инструкция">
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {errorMsg && <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4"><p className="text-red-400 text-sm">{errorMsg}</p></div>}
              {!profile && <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4"><p className="text-yellow-400 text-sm">Войдите в аккаунт для оплаты</p></div>}

              <Button onClick={handlePay} disabled={isLoading || !selectedMethod}
                className="w-full h-14 bg-white text-black font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-zinc-200 transition-all active:scale-95">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : `Оплатить ${productPrice ? `${productPrice} ₽` : ''}`}
              </Button>
            </div>
          )}

        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default PaymentModal;