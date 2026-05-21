import { fetchYahooQuote } from "../providers/yahoo.provider";
import { mapYahooQuoteToStockQuote } from "../providers/yahoo.mapper";
import { StockQuote } from "../types/portfolio.types";

const TTL = 15_000; // matches Yahoo's own exchangeDataDelayedBy

interface CacheEntry {
  data: StockQuote;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  const hit = cache.get(symbol);
  if (hit && Date.now() - hit.fetchedAt < TTL) {
    return hit.data;
  }

  try {
    const yahooQuote = await fetchYahooQuote(symbol);
    if (!yahooQuote) return null;
    const data = mapYahooQuoteToStockQuote(yahooQuote);
    cache.set(symbol, { data, fetchedAt: Date.now() });
    return data;
  } catch (err) {
    console.warn(`[finance.repository] Failed to fetch ${symbol}:`, err);
    // return stale entry rather than dropping the holding entirely
    return hit?.data ?? null;
  }
}
