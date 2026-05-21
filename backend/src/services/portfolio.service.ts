import { mockPortfolio } from "../data/mockPortfolio";
import { getStockQuote } from "../repositories/finance.repository";
import {
  EnrichedPortfolioHolding,
  PortfolioHolding,
  SectorSummary,
} from "../types/portfolio.types";

// Fires at most CONCURRENCY fetches at once avoids Yahoo 429s on cold start. Yahoo approx allows 2k calls per hour
const CONCURRENCY = 5;

async function batchedAll<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = await Promise.all(items.slice(i, i + concurrency).map(fn));
    results.push(...batch);
  }
  return results;
}

export async function getEnrichedPortfolio(): Promise<
  EnrichedPortfolioHolding[]
> {
  const results = await batchedAll(
    mockPortfolio,
    CONCURRENCY,
    async (holding: PortfolioHolding) => {
      const quote = await getStockQuote(holding.symbol);
      if (!quote) return null;

      const investment = holding.purchasePrice * holding.quantity;
      const presentValue = quote.currentPrice * holding.quantity;
      const gainLoss = presentValue - investment;
      const gainLossPercent = (gainLoss / investment) * 100;

      return {
        ...holding,
        quote,
        investment,
        presentValue,
        gainLoss,
        gainLossPercent,
        portfolioWeight: 0,
      };
    },
  );

  const enriched = results.filter((h) => h !== null);

  const totalValue = enriched.reduce((sum, h) => sum + h.presentValue, 0);

  return enriched.map((h) => ({
    ...h,
    portfolioWeight: (h.presentValue / totalValue) * 100,
  }));
}

export async function getPortfolioGroupedBySector(): Promise<SectorSummary[]> {
  const holdings = await getEnrichedPortfolio();

  const sectorMap = new Map<string, EnrichedPortfolioHolding[]>();
  for (const holding of holdings) {
    const existing = sectorMap.get(holding.sector) ?? [];
    sectorMap.set(holding.sector, [...existing, holding]);
  }

  return Array.from(sectorMap.entries()).map(([sector, holdings]) => ({
    sector,
    totalInvestment: holdings.reduce((sum, h) => sum + h.investment, 0),
    totalPresentValue: holdings.reduce((sum, h) => sum + h.presentValue, 0),
    totalGainLoss: holdings.reduce((sum, h) => sum + h.gainLoss, 0),
    holdings,
  }));
}
