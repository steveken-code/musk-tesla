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

export const useStockPrices = (pollInterval: number = 15000): UseStockPricesResult => {
  const [data, setData] = useState<StockPricesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const { data: responseData, error: fetchError } = await supabase.functions.invoke('stock-prices');

      if (fetchError) {
        console.error('Error fetching stock prices:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (responseData?.stocks) {
        setData(responseData as StockPricesData);
        setError(null);
      } else if (responseData?.error) {
        setError(responseData.error);
      }
    } catch (err) {
      console.error('Failed to fetch stock prices:', err);
      setError('Failed to fetch stock prices');
    } finally {
      setLoading(false);
    }
  }, []);

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
