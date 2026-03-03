import React, { createContext, useContext, useState, ReactNode } from 'react';

type Currency = 'VB' | 'RUB' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (vbPrice: number) => string;
  getSymbol: () => string;
}

const rates: Record<Currency, number> = {
  VB: 1,
  RUB: 1, // 1 VB = 1 RUB
  USD: 0.01, // 1 VB = 0.01 USD
};

const symbols: Record<Currency, string> = {
  VB: 'VB',
  RUB: '₽',
  USD: '$',
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('VB');

  const convertPrice = (vbPrice: number) => {
    const value = vbPrice * rates[currency];
    return value.toLocaleString('ru-RU');
  };

  const getSymbol = () => symbols[currency];

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, getSymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};