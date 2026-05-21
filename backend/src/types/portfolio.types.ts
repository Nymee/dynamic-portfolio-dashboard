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
  earningsDate: Date | null;
  dataDelay: number;
}

export interface PortfolioHolding {
  symbol: string;
  purchasePrice: number;
  quantity: number;
  sector: string;
}

export interface EnrichedPortfolioHolding extends PortfolioHolding {
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
