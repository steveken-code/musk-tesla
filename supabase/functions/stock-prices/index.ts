import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StockQuote {
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

interface FinnhubQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

interface FinnhubCandle {
  v: number[];  // Volume array
  c: number[];  // Close prices
  h: number[];  // High prices
  l: number[];  // Low prices
  o: number[];  // Open prices
  t: number[];  // Timestamps
  s: string;    // Status
}

const stockInfo: Record<string, string> = {
  'TSLA': 'Tesla, Inc.',
  'SPY': 'S&P 500 ETF',
  'QQQ': 'NASDAQ-100 ETF',
  'RIVN': 'Rivian',
  'LCID': 'Lucid Motors',
  'TM': 'Toyota Motor',
  'STLA': 'Stellantis',
  'F': 'Ford',
  'GM': 'General Motors',
};

const symbols = Object.keys(stockInfo);

// Simple in-memory cache to avoid rate limits
let cachedData: { stocks: StockQuote[]; lastUpdated: string; marketStatus: string } | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 60 seconds cache

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getMarketStatus(): string {
  const now = new Date();
  const estOffset = -5;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const est = new Date(utc + (3600000 * estOffset));
  
  const day = est.getDay();
  const hour = est.getHours();
  const minute = est.getMinutes();
  const timeValue = hour * 60 + minute;
  
  // Weekend
  if (day === 0 || day === 6) return 'closed';
  
  // Pre-market: 4:00 AM - 9:30 AM EST
  if (timeValue >= 240 && timeValue < 570) return 'pre-market';
  
  // Regular: 9:30 AM - 4:00 PM EST
  if (timeValue >= 570 && timeValue < 960) return 'regular';
  
  // After-hours: 4:00 PM - 8:00 PM EST
  if (timeValue >= 960 && timeValue < 1200) return 'after-hours';
  
  return 'closed';
}

async function fetchVolumeData(symbol: string, apiKey: string): Promise<number> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const from = now - 86400; // 24 hours ago
    
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${now}&token=${apiKey}`
    );
    
    if (!response.ok) {
      console.warn(`Failed to fetch volume for ${symbol}: ${response.status}`);
      return 0;
    }
    
    const data: FinnhubCandle = await response.json();
    
    // Check if we got valid candle data
    if (data.s === 'no_data' || !data.v || data.v.length === 0) {
      return 0;
    }
    
    // Return the most recent volume
    return data.v[data.v.length - 1] || 0;
  } catch (error) {
    console.error(`Error fetching volume for ${symbol}:`, error);
    return 0;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    
    if (!finnhubApiKey) {
      console.error('FINNHUB_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return cached data if still fresh
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached stock data');
      return new Response(
        JSON.stringify(cachedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching fresh stock data from Finnhub');

    const stocks: StockQuote[] = [];

    // Fetch sequentially with delays to avoid rate limiting (Finnhub free tier: 60 calls/min)
    for (const symbol of symbols) {
      try {
        // Fetch quote data
        const quoteResponse = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`
        );
        
        if (quoteResponse.status === 429) {
          console.warn(`Rate limited on ${symbol}, using cached data`);
          if (cachedData) {
            return new Response(
              JSON.stringify(cachedData),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          break;
        }
        
        if (!quoteResponse.ok) {
          console.error(`Failed to fetch ${symbol}: ${quoteResponse.status}`);
          continue;
        }
        
        const quoteData: FinnhubQuote = await quoteResponse.json();
        
        // Check if we got valid data
        if (quoteData.c === 0 && quoteData.pc === 0) {
          console.warn(`No data available for ${symbol}`);
          continue;
        }

        // Add delay before volume request
        await delay(100);
        
        // Fetch volume data from candle endpoint
        const volume = await fetchVolumeData(symbol, finnhubApiKey);
        
        stocks.push({
          symbol,
          name: stockInfo[symbol],
          price: quoteData.c,
          change: quoteData.d,
          changePercent: quoteData.dp,
          volume,
          high: quoteData.h,
          low: quoteData.l,
          open: quoteData.o,
          previousClose: quoteData.pc,
        });

        // Add delay between requests to avoid rate limiting
        await delay(150);
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
      }
    }

    // Only update cache if we got some data
    if (stocks.length > 0) {
      const responseData = {
        stocks,
        lastUpdated: new Date().toISOString(),
        marketStatus: getMarketStatus(),
      };

      cachedData = responseData;
      cacheTimestamp = now;

      console.log(`Successfully fetched ${stocks.length} stock quotes with volume data`);

      return new Response(
        JSON.stringify(responseData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no new data but we have cache, return stale cache
    if (cachedData) {
      console.log('No new data, returning stale cached data');
      return new Response(
        JSON.stringify(cachedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'No stock data available', stocks: [], marketStatus: getMarketStatus() }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in stock-prices function:', error);
    
    // Return cached data if available, even if stale
    if (cachedData) {
      console.log('Returning stale cached data due to error');
      return new Response(
        JSON.stringify(cachedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Failed to fetch stock prices' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
