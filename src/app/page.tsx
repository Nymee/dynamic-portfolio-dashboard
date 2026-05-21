import { Metadata } from "next";
import { portfolioRepository } from "@/repositories/portfolio.repository";
import PortfolioDashboard from "@/components/portfolio-dashboard";

export const metadata: Metadata = {
  title: "Portfolio Dashboard",
  description:
    "Live portfolio tracker with real-time NSE stock prices, sector grouping, and gain/loss analysis.",
};

export default async function DashboardPage() {
  let initialData = await portfolioRepository.getSectors().catch(() => []);

  return <PortfolioDashboard initialData={initialData} />;
}
