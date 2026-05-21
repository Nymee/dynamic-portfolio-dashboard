export interface YahooQuoteResponse {
  symbol: string;

  longName?: string;

  currency?: string;

  fullExchangeName?: string;

  regularMarketPrice?: number;

  regularMarketChange?: number;

  regularMarketChangePercent?: number;

  trailingPE?: number;

  marketCap?: number;

  earningsTimestamp?: Date;

  exchangeDataDelayedBy?: number;
}
