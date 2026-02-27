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
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

const stockNames: Record<string, string> = {
  'TSLA': 'Tesla, Inc.',
  'SPY':  'S&P 500 ETF',
  'QQQ':  'NASDAQ-100 ETF',
  'RIVN': 'Rivian',
  'LCID': 'Lucid Motors',
  'TM':   'Toyota Motor',
  'STLA': 'Stellantis',
  'F':    'Ford',
  'GM':   'General Motors',
};

const symbols = Object.keys(stockNames);

let cachedData: { stocks: StockQuote[]; lastUpdated: string; marketStatus: string } | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000;

// Cache volume data separately (changes less frequently)
let volumeCache: Record<string, number> = {};
let volumeCacheTimestamp = 0;
const VOLUME_CACHE_DURATION = 300000; // 5 minutes

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
  if (day === 0 || day === 6) return 'closed';
  if (timeValue >= 240 && timeValue < 570) return 'pre-market';
  if (timeValue >= 570 && timeValue < 960) return 'regular';
  if (timeValue >= 960 && timeValue < 1200) return 'after-hours';
  return 'closed';
}

async function fetchVolumeFromYahoo(symbol: string): Promise<number> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5d&interval=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (!response.ok) {
      console.warn(`Yahoo volume fetch failed for ${symbol}: ${response.status}`);
      return 0;
    }
    const data = await response.json();
    const volumes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.volume;
    if (Array.isArray(volumes) && volumes.length > 0) {
      // Return the last non-null volume (latest trading day)
      for (let i = volumes.length - 1; i >= 0; i--) {
        if (volumes[i] != null && volumes[i] > 0) return volumes[i];
      }
    }
    return 0;
  } catch (error) {
    console.error(`Error fetching Yahoo volume for ${symbol}:`, error);
    return 0;
  }
}

async function fetchAllVolumes(): Promise<Record<string, number>> {
  const now = Date.now();
  if (Object.keys(volumeCache).length > 0 && (now - volumeCacheTimestamp) < VOLUME_CACHE_DURATION) {
    return volumeCache;
  }

  console.log('Fetching volume data from Yahoo Finance');
  const results: Record<string, number> = {};

  // Fetch volumes in parallel (Yahoo doesn't have strict rate limits)
  const promises = symbols.map(async (symbol) => {
    const vol = await fetchVolumeFromYahoo(symbol);
    results[symbol] = vol;
  });

  await Promise.all(promises);

  volumeCache = results;
  volumeCacheTimestamp = now;
  return results;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!finnhubApiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      return new Response(
        JSON.stringify(cachedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching fresh stock data');

    // Fetch volumes in parallel with quote data
    const volumePromise = fetchAllVolumes();
    const stocks: StockQuote[] = [];

    for (const symbol of symbols) {
      try {
        const quoteResponse = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`
        );

        if (quoteResponse.status === 429) {
          console.warn(`Rate limited on ${symbol}`);
          if (cachedData) {
            return new Response(
              JSON.stringify(cachedData),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          break;
        }

        if (!quoteResponse.ok) continue;

        const quoteData: FinnhubQuote = await quoteResponse.json();
        if (quoteData.c === 0 && quoteData.pc === 0) continue;

        stocks.push({
          symbol,
          name: stockNames[symbol],
          price: quoteData.c,
          change: quoteData.d,
          changePercent: quoteData.dp,
          volume: 0, // filled below
          high: quoteData.h,
          low: quoteData.l,
          open: quoteData.o,
          previousClose: quoteData.pc,
        });

        await delay(150);
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
      }
    }

    // Merge volume data
    const volumes = await volumePromise;
    for (const stock of stocks) {
      stock.volume = volumes[stock.symbol] || 0;
    }

    if (stocks.length > 0) {
      const responseData = {
        stocks,
        lastUpdated: new Date().toISOString(),
        marketStatus: getMarketStatus(),
      };
      cachedData = responseData;
      cacheTimestamp = now;
      console.log(`Fetched ${stocks.length} quotes with real volume data`);
      return new Response(
        JSON.stringify(responseData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (cachedData) {
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
    if (cachedData) {
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
