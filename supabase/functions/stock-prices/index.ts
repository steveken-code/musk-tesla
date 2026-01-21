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
const CACHE_DURATION = 60000; // 60 seconds cache - increased to avoid rate limiting

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
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`
        );
        
        if (response.status === 429) {
          console.warn(`Rate limited on ${symbol}, using cached data`);
          // If we hit rate limit and have cache, return it
          if (cachedData) {
            return new Response(
              JSON.stringify(cachedData),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          break;
        }
        
        if (!response.ok) {
          console.error(`Failed to fetch ${symbol}: ${response.status}`);
          continue;
        }
        
        const data: FinnhubQuote = await response.json();
        
        // Check if we got valid data
        if (data.c === 0 && data.pc === 0) {
          console.warn(`No data available for ${symbol}`);
          continue;
        }
        
        stocks.push({
          symbol,
          name: stockInfo[symbol],
          price: data.c,
          change: data.d,
          changePercent: data.dp,
          volume: 0,
          high: data.h,
          low: data.l,
          open: data.o,
          previousClose: data.pc,
        });

        // Add delay between requests to avoid rate limiting (150ms = ~6 req/sec, well under 60/min)
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

      console.log(`Successfully fetched ${stocks.length} stock quotes`);

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