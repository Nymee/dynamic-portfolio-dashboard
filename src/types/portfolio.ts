export interface StockQuote {
  symbol: string;
  companyName: string;
  exchange: string;
  currency: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  peRatio: number | null;
  marketCap: number | null;
  earningsDate: string | null;
  dataDelay: number;
}

export interface EnrichedPortfolioHolding {
  symbol: string;
  purchasePrice: number;
  quantity: number;
  sector: string;
  quote: StockQuote;
  investment: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  portfolioWeight: number;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  holdings: EnrichedPortfolioHolding[];
}

export interface PortfolioApiResponse {
  success: boolean;
  data: SectorSummary[];
  message?: string;
}

export interface PortfolioResult {
  sectors: SectorSummary[];
  stale: boolean;
  cachedAt: Date | null;
}
