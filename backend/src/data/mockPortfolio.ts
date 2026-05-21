import { PortfolioHolding } from "../types/portfolio.types";

export const mockPortfolio: PortfolioHolding[] = [
  // Financial Sector
  { symbol: "HDFCBANK.NS",    purchasePrice: 1480, quantity: 5,  sector: "Financial" },
  { symbol: "BAJFINANCE.NS",  purchasePrice: 6200, quantity: 2,  sector: "Financial" },
  { symbol: "ICICIBANK.NS",   purchasePrice: 780,  quantity: 10, sector: "Financial" },
  { symbol: "BAJAJHFL.NS",    purchasePrice: 140,  quantity: 8,  sector: "Financial" },

  // Tech Sector
  { symbol: "AFFLE.NS",       purchasePrice: 1100, quantity: 6,  sector: "Tech" },
  { symbol: "LTIM.NS",        purchasePrice: 5200, quantity: 2,  sector: "Tech" },
  { symbol: "KPITTECH.NS",    purchasePrice: 1200, quantity: 5,  sector: "Tech" },
  { symbol: "TATATECH.NS",    purchasePrice: 1050, quantity: 6,  sector: "Tech" },
  { symbol: "TANLA.NS",       purchasePrice: 1200, quantity: 4,  sector: "Tech" },

  // Consumer
  { symbol: "DMART.NS",       purchasePrice: 4200, quantity: 2,  sector: "Consumer" },
  { symbol: "TATACONSUM.NS",  purchasePrice: 900,  quantity: 8,  sector: "Consumer" },
  { symbol: "PIDILITIND.NS",  purchasePrice: 2600, quantity: 3,  sector: "Consumer" },

  // Power
  { symbol: "TATAPOWER.NS",   purchasePrice: 220,  quantity: 30, sector: "Power" },
  { symbol: "KPIGREEN.NS",    purchasePrice: 700,  quantity: 4,  sector: "Power" },
  { symbol: "SUZLON.NS",      purchasePrice: 28,   quantity: 80, sector: "Power" },

  // Pipe Sector
  { symbol: "HARIOMPIPE.NS",  purchasePrice: 650,  quantity: 5,  sector: "Pipe" },
  { symbol: "ASTRAL.NS",      purchasePrice: 1800, quantity: 4,  sector: "Pipe" },
  { symbol: "POLYCAB.NS",     purchasePrice: 4200, quantity: 3,  sector: "Pipe" },

  // Others
  { symbol: "CLEANSCI.NS",    purchasePrice: 1800, quantity: 4,  sector: "Others" },
  { symbol: "DEEPAKNITR.NS",  purchasePrice: 2200, quantity: 3,  sector: "Others" },
  { symbol: "FINEORG.NS",     purchasePrice: 4500, quantity: 2,  sector: "Others" },
  { symbol: "GRAVITA.NS",     purchasePrice: 1200, quantity: 5,  sector: "Others" },
  { symbol: "SBILIFE.NS",     purchasePrice: 1300, quantity: 6,  sector: "Others" },
];
