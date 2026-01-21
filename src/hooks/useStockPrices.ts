import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface StockPricesData {
  stocks: StockQuote[];
  lastUpdated: string;
  marketStatus: 'pre-market' | 'regular' | 'after-hours' | 'closed';
}

interface UseStockPricesResult {
  data: StockPricesData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const STOCK_CACHE_KEY = 'stock_prices_cache_v1';

const readCachedPrices = (): StockPricesData | null => {
  try {
    const raw = localStorage.getItem(STOCK_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StockPricesData;
  } catch {
    return null;
  }
};

const writeCachedPrices = (data: StockPricesData) => {
  try {
    localStorage.setItem(STOCK_CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
};

export const useStockPrices = (pollInterval: number = 15000): UseStockPricesResult => {
  const initialCache = readCachedPrices();
  const [data, setData] = useState<StockPricesData | null>(initialCache);
  const [loading, setLoading] = useState(!initialCache);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const { data: responseData, error: fetchError } = await supabase.functions.invoke('stock-prices');

      if (fetchError) {
        console.error('Error fetching stock prices:', fetchError);
        setError(fetchError.message);
        // Keep last known good data if available
        if (!data) {
          const cached = readCachedPrices();
          if (cached) setData(cached);
        }
        return;
      }

      if (responseData?.stocks) {
        const next = responseData as StockPricesData;

        // Avoid overwriting a good state with empty data (common during rate limits)
        if (Array.isArray(next.stocks) && next.stocks.length === 0) {
          setError('No stock data available');
          if (!data) {
            const cached = readCachedPrices();
            if (cached) setData(cached);
          }
          return;
        }

        setData(next);
        writeCachedPrices(next);
        setError(null);
      } else if (responseData?.error) {
        setError(responseData.error);
        if (!data) {
          const cached = readCachedPrices();
          if (cached) setData(cached);
        }
      }
    } catch (err) {
      console.error('Failed to fetch stock prices:', err);
      setError('Failed to fetch stock prices');
      if (!data) {
        const cached = readCachedPrices();
        if (cached) setData(cached);
      }
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    // Initial fetch
    fetchPrices();

    // Set up polling
    const interval = setInterval(fetchPrices, pollInterval);

    return () => clearInterval(interval);
  }, [fetchPrices, pollInterval]);

  return { data, loading, error, refetch: fetchPrices };
};

// Helper hook to get a specific stock
export const useStockPrice = (symbol: string, pollInterval: number = 15000) => {
  const { data, loading, error, refetch } = useStockPrices(pollInterval);
  
  const stock = data?.stocks.find(s => s.symbol === symbol) || null;
  
  return {
    stock,
    marketStatus: data?.marketStatus || 'closed',
    lastUpdated: data?.lastUpdated || null,
    loading,
    error,
    refetch,
  };
};
