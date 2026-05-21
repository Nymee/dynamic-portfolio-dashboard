import { fetchYahooQuote } from "../providers/yahoo.provider";
import { mapYahooQuoteToStockQuote } from "../providers/yahoo.mapper";
import { StockQuote } from "../types/portfolio.types";

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const yahooQuote = await fetchYahooQuote(symbol);
  return mapYahooQuoteToStockQuote(yahooQuote);
}
