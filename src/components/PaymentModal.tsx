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
import { CreditCard, Wallet, Landmark, Bitcoin, X, ExternalLink, Loader2, CheckCircle } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId?: string;
  productPrice?: number;
  containerRef?: React.RefObject<HTMLDivElement>;
}

const paymentMethods = [
  {
    id: 'kaspi',
    name: 'Kaspi (Visa)',
    icon: <Landmark className="w-4 h-4" />,
    infoUrl: 'https://telegra.ph/Oplata-Kaspi-10-31',
  },
  {
    id: 'privat',
    name: 'Приват Банк',
    icon: <Landmark className="w-4 h-4" />,
    infoUrl: 'https://telegra.ph/Oplata-PrivatBank-10-31',
  },
  {
    id: 'polski',
    name: 'Bank Polski',
    icon: <Landmark className="w-4 h-4" />,
    infoUrl: 'https://telegra.ph/Oplata-Bank-Polski-10-31',
  },
  {
    id: 'rb',
    name: 'Оплата с РБ',
    icon: <CreditCard className="w-4 h-4" />,
    infoUrl: 'https://telegra.ph/Oplata-s-belarus-10-31',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <Wallet className="w-4 h-4" />,
    infoUrl: 'https://telegra.ph/Oplata-PayPal-10-31',
  },
  {
    id: 'crypto',
    name: 'Криптовалюта',
    icon: <Bitcoin className="w-4 h-4" />,
    infoUrl: 'https://telegra.ph/Oplata-PayPal-10-31',
  },
];

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  productName,
  productId,
  productPrice,
  containerRef,
}) => {
  const { profile } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePay = async () => {
    if (!selectedMethod) {
      setErrorMsg('Выберите способ оплаты');
      return;
    }
    if (!profile) {
      setErrorMsg('Необходимо войти в аккаунт');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('https://ldvlahtoiwimroycqcav.supabase.co/functions/v1/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdmxhaHRvaXdpbXJveWNxY2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDIwODksImV4cCI6MjA4ODExODA4OX0.DCM-xvruLo2Sho-6I_o87aa5OENCgxCfmyYptMk86BE',
        },
        body: JSON.stringify({
          amount: productPrice || 0,
          productName,
          profileId: profile.id,
          currency: 'RUB',
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.error) {
        setErrorMsg(data?.error || 'Ошибка создания платежа');
        setIsLoading(false);
        return;
      }

      setPaymentUrl(data.redirect);
      setTransactionId(data.transactionId);
      setStatus('pending');
      window.open(data.redirect, '_blank');

    } catch (e) {
      setErrorMsg('Ошибка соединения с платёжным сервисом');
    }

    setIsLoading(false);
  };

  const handleCheckStatus = async () => {
    if (!transactionId || !profile) return;
    setIsLoading(true);

    try {
      const response = await fetch('https://ldvlahtoiwimroycqcav.supabase.co/functions/v1/check-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdmxhaHRvaXdpbXJveWNxY2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDIwODksImV4cCI6MjA4ODExODA4OX0.DCM-xvruLo2Sho-6I_o87aa5OENCgxCfmyYptMk86BE',
        },
        body: JSON.stringify({
          transactionId,
          profileId: profile.id,
          productName,
          productId: productId || '',
          price: productPrice || 0,
        }),
      });

      const data = await response.json();

      if (data?.status === 'CONFIRMED') {
        setStatus('success');
      } else if (data?.status === 'CANCELED') {
        setStatus('error');
        setErrorMsg('Платёж отменён');
      } else {
        setErrorMsg('Платёж ещё не подтверждён. Попробуйте через минуту.');
      }
    } catch (e) {
      setErrorMsg('Ошибка проверки статуса');
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setPaymentUrl(null);
    setTransactionId(null);
    setStatus('idle');
    setErrorMsg('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogPortal container={containerRef?.current}>
        <DialogOverlay className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="absolute left-1/2 top-1/2 z-[101] w-[92%] max-w-[480px] -translate-x-1/2 -translate-y-1/2 gap-0 border border-zinc-800 bg-black p-6 shadow-2xl duration-200 rounded-[32px] outline-none"
        >
          <DialogHeader className="mb-6">
            <div className="flex justify-between items-start">
              <DialogTitle className="text-xl font-bold uppercase tracking-tight text-white">
                {status === 'success' ? '✅ Оплата прошла!' : 'ОПЛАТА ЗАКАЗА'}
              </DialogTitle>
              <button onClick={handleClose} className="text-zinc-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <DialogDescription className="text-zinc-500 text-xs text-left mt-1">
              {status === 'success'
                ? `${productName} добавлен в ваши покупки`
                : `Выберите способ оплаты для «${productName}»`}
            </DialogDescription>
          </DialogHeader>

          {status === 'success' ? (
            <div className="flex flex-col items-center gap-6 py-6">
              <CheckCircle className="text-white" size={64} />
              <p className="text-zinc-400 text-center text-sm">Покупка успешно завершена и добавлена в ваш профиль.</p>
              <Button onClick={handleClose} className="w-full h-14 bg-white text-black font-black uppercase rounded-2xl">
                Закрыть
              </Button>
            </div>
          ) : status === 'pending' ? (
            <div className="space-y-4">
              <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5 text-center space-y-3">
                <p className="text-zinc-300 text-sm font-medium">Страница оплаты открыта в новой вкладке.</p>
                <p className="text-zinc-500 text-xs">После оплаты нажмите кнопку ниже для подтверждения.</p>
              </div>
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <p className="text-red-400 text-sm">{errorMsg}</p>
                </div>
              )}
              <Button
                onClick={handleCheckStatus}
                disabled={isLoading}
                className="w-full h-14 bg-white text-black font-black uppercase rounded-2xl hover:bg-zinc-200"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Я оплатил — проверить'}
              </Button>
              <button
                onClick={() => paymentUrl && window.open(paymentUrl, '_blank')}
                className="w-full text-center text-zinc-500 hover:text-white text-sm transition-colors"
              >
                Открыть страницу оплаты снова
              </button>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`relative flex items-center group rounded-2xl border transition-all cursor-pointer ${
                    selectedMethod === method.id
                      ? 'border-white bg-zinc-900'
                      : 'border-transparent bg-zinc-900/50 hover:bg-zinc-800/80'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex-1 flex items-center gap-3 p-4">
                    <span className="text-zinc-400">{method.icon}</span>
                    <span className="font-medium text-[14px] text-zinc-100">{method.name}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); window.open(method.infoUrl, '_blank'); }}
                    className="p-3 mr-2 rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                    title="Инструкция по оплате"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              ))}

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <p className="text-red-400 text-sm">{errorMsg}</p>
                </div>
              )}

              {!profile && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                  <p className="text-yellow-400 text-sm">Войдите в аккаунт для оплаты</p>
                </div>
              )}

              <Button
                onClick={handlePay}
                disabled={isLoading || !selectedMethod}
                className="w-full h-14 bg-white text-black font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 mt-2"
              >
                {isLoading
                  ? <Loader2 className="animate-spin" size={20} />
                  : `Оплатить ${productPrice ? `${productPrice} ₽` : ''}`}
              </Button>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default PaymentModal;