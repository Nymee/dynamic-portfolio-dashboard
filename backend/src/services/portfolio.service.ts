import { mockPortfolio } from "../data/mockPortfolio";
import { getStockQuote } from "../repositories/finance.repository";
import { EnrichedPortfolioHolding, SectorSummary } from "../types/portfolio.types";

export async function getEnrichedPortfolio(): Promise<EnrichedPortfolioHolding[]> {
  const enriched = await Promise.all(
    mockPortfolio.map(async (holding) => {
      const quote = await getStockQuote(holding.symbol);

      const investment = holding.purchasePrice * holding.quantity;
      const presentValue = quote.currentPrice * holding.quantity;
      const gainLoss = presentValue - investment;
      const gainLossPercent = (gainLoss / investment) * 100;

      return { ...holding, quote, investment, presentValue, gainLoss, gainLossPercent, portfolioWeight: 0 };
    })
  );

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
