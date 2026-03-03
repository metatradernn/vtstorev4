import React, { createContext, useContext, useState, ReactNode } from 'react';

type Currency = 'VB' | 'RUB' | 'USD' | 'EUR' | 'UAH' | 'BYN';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (vbPrice: number) => string;
  getSymbol: () => string;
}

const rates: Record<Currency, number> = {
  VB: 1,
  RUB: 1,
  USD: 0.01,
  EUR: 0.009,
  UAH: 0.45,
  BYN: 0.035,
};

const symbols: Record<Currency, string> = {
  VB: 'VB',
  RUB: '₽',
  USD: '$',
  EUR: '€',
  UAH: '₴',
  BYN: 'Br',
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