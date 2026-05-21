import YahooFinance from "yahoo-finance2";

import { YahooQuoteResponse } from "../types/yahoo.types";
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

export async function fetchYahooQuote(
  symbol: string,
): Promise<YahooQuoteResponse> {
  return yahooFinance.quote(symbol) as Promise<YahooQuoteResponse>;
}
