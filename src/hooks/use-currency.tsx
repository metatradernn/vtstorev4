import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'VB' | 'RUB' | 'USD' | 'EUR' | 'UAH' | 'BYN' | 'KZT' | 'PLN' | 'GBP' | 'TRY';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (rubPrice: number) => string;
  convertTo: (rubPrice: number, toCurrency: Currency) => string;
  getSymbol: () => string;
  isLoadingRates: boolean;
}

const symbols: Record<Currency, string> = {
  VB:  'VB',
  RUB: '₽',
  USD: '$',
  EUR: '€',
  UAH: '₴',
  BYN: 'Br',
  KZT: '₸',
  PLN: 'zł',
  GBP: '£',
  TRY: '₺',
};

// Fallback курсы на случай если API недоступен
const FALLBACK_RATES: Record<Currency, number> = {
  VB:  1,
  RUB: 1,
  USD: 0.011,
  EUR: 0.010,
  UAH: 0.45,
  BYN: 0.035,
  KZT: 4.8,
  PLN: 0.044,
  GBP: 0.0087,
  TRY: 0.37,
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('RUB');
  const [liveRates, setLiveRates] = useState<Record<Currency, number>>(FALLBACK_RATES);
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/RUB');
        const data = await res.json();
        if (data.rates) {
          setLiveRates({
            VB:  1,
            RUB: 1,
            USD: data.rates.USD,
            EUR: data.rates.EUR,
            UAH: data.rates.UAH,
            BYN: data.rates.BYN,
            KZT: data.rates.KZT,
            PLN: data.rates.PLN,
            GBP: data.rates.GBP,
            TRY: data.rates.TRY,
          });
        }
      } catch {
        // используем fallback
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchRates();
    // Обновляем курсы каждые 10 минут
    const interval = setInterval(fetchRates, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const convertPrice = (rubPrice: number): string => {
    return convertTo(rubPrice, currency);
  };

  const convertTo = (rubPrice: number, toCurrency: Currency): string => {
    if (toCurrency === 'VB') return rubPrice.toLocaleString('ru-RU');
    const rate = liveRates[toCurrency] ?? FALLBACK_RATES[toCurrency];
    const converted = rubPrice * rate;
    if (converted < 1) return converted.toFixed(2);
    if (converted < 100) return converted.toFixed(1);
    return Math.ceil(converted).toLocaleString('ru-RU');
  };

  const getSymbol = () => symbols[currency];

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, convertTo, getSymbol, isLoadingRates }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};