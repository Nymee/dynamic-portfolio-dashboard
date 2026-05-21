import { fetchYahooQuote } from "../providers/yahoo.provider";
import { mapYahooQuoteToStockQuote } from "../providers/yahoo.mapper";
import { StockQuote } from "../types/portfolio.types";

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const yahooQuote = await fetchYahooQuote(symbol);
    if (!yahooQuote) return null;
    return mapYahooQuoteToStockQuote(yahooQuote);
  } catch (err) {
    console.warn(`[finance.repository] Failed to fetch quote for ${symbol}:`, err);
    return null;
  }
}
