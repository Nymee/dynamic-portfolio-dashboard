import { YahooQuoteResponse } from "../types/yahoo.types";

import { StockQuote } from "../types/portfolio.types";

export function mapYahooQuoteToStockQuote(
  quote: YahooQuoteResponse,
): StockQuote {
  return {
    symbol: quote.symbol,

    companyName: quote.longName ?? "Unknown",

    exchange: quote.fullExchangeName ?? "Unknown",

    currency: quote.currency ?? "INR",

    currentPrice: quote.regularMarketPrice ?? 0,

    priceChange: quote.regularMarketChange ?? 0,

    priceChangePercent: quote.regularMarketChangePercent ?? 0,

    peRatio: quote.trailingPE ?? null,

    marketCap: quote.marketCap ?? null,

    earningsDate: quote.earningsTimestamp ?? null,

    dataDelay: quote.exchangeDataDelayedBy ?? 0,
  };
}
