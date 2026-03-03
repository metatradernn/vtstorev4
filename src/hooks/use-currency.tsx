import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'VB' | 'RUB' | 'USD' | 'EUR' | 'UAH' | 'BYN' | 'KZT' | 'PLN' | 'GBP' | 'TRY';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (rubPrice: number) => string;
  convertTo: (rubPrice: number, toCurrency: Currency) => string;
  getSymbol: () => string;
  isLoadingRates: boolean;
  ratesUpdatedAt: Date | null;
}

export const symbols: Record<Currency, string> = {
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

// Fallback курсы (приблизительные, на случай если API недоступен)
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
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // open.er-api.com — бесплатный API с актуальными курсами, обновляется каждые 24ч
        const res = await fetch('https://open.er-api.com/v6/latest/RUB');
        const data = await res.json();

        if (data.result === 'success' && data.rates) {
          const rates = data.rates;
          console.log('[CurrencyProvider] Актуальные курсы к RUB:', {
            USD: rates.USD,
            EUR: rates.EUR,
            UAH: rates.UAH,
            BYN: rates.BYN,
            KZT: rates.KZT,
            PLN: rates.PLN,
            GBP: rates.GBP,
            TRY: rates.TRY,
          });

          setLiveRates({
            VB:  1,
            RUB: 1,
            USD: rates.USD,
            EUR: rates.EUR,
            UAH: rates.UAH,
            BYN: rates.BYN ?? rates.BYR ?? FALLBACK_RATES.BYN,
            KZT: rates.KZT,
            PLN: rates.PLN,
            GBP: rates.GBP,
            TRY: rates.TRY,
          });
          setRatesUpdatedAt(new Date());
        } else {
          throw new Error('Bad response from open.er-api.com');
        }
      } catch (err) {
        console.warn('[CurrencyProvider] open.er-api.com недоступен, пробуем fallback API...', err);
        // Второй источник — exchangerate-api.com
        try {
          const res2 = await fetch('https://api.exchangerate-api.com/v4/latest/RUB');
          const data2 = await res2.json();
          if (data2.rates) {
            setLiveRates({
              VB:  1,
              RUB: 1,
              USD: data2.rates.USD,
              EUR: data2.rates.EUR,
              UAH: data2.rates.UAH,
              BYN: data2.rates.BYN ?? FALLBACK_RATES.BYN,
              KZT: data2.rates.KZT,
              PLN: data2.rates.PLN,
              GBP: data2.rates.GBP,
              TRY: data2.rates.TRY,
            });
            setRatesUpdatedAt(new Date());
            console.log('[CurrencyProvider] Курсы загружены из fallback API');
          }
        } catch {
          console.error('[CurrencyProvider] Оба API недоступны, используем fallback курсы');
        }
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchRates();
    // Обновляем курсы каждые 30 минут
    const interval = setInterval(fetchRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const convertTo = (rubPrice: number, toCurrency: Currency): string => {
    if (toCurrency === 'VB') return rubPrice.toLocaleString('ru-RU');
    const rate = liveRates[toCurrency] ?? FALLBACK_RATES[toCurrency];
    const converted = rubPrice * rate;
    if (converted < 1) return converted.toFixed(2);
    if (converted < 100) return converted.toFixed(1);
    return Math.ceil(converted).toLocaleString('ru-RU');
  };

  const convertPrice = (rubPrice: number): string => {
    return convertTo(rubPrice, currency);
  };

  const getSymbol = () => symbols[currency];

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, convertTo, getSymbol, isLoadingRates, ratesUpdatedAt }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};
