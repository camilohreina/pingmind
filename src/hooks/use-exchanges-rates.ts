import { getExchangeRates } from '@/services/utils.services';
import { useState, useEffect } from 'react';

type ExchangeRates = {
  [key: string]: number;
};

export function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await getExchangeRates();
        setRates(data.rates);
        setError(null);
      } catch (err) {
        setError('Error fetching exchange rates');
        console.error('Error fetching exchange rates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  return { rates, loading, error };
}