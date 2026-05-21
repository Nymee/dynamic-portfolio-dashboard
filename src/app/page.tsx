import { Metadata } from "next";
import { portfolioRepository } from "@/repositories/portfolio.repository";
import { AutoRefresh } from "@/components/auto-refresh";
import PortfolioTable from "@/components/portfolio-table";
import { formatCurrency, formatPercent } from "@/lib/format";

export const metadata: Metadata = {
  title: "Portfolio Dashboard",
  description:
    "Live portfolio tracker with real-time NSE stock prices, sector grouping, and gain/loss analysis.",
};

function SummaryCard({
  label,
  value,
  percent,
  colored,
}: {
  label: string;
  value: number;
  percent?: number;
  colored?: boolean;
}) {
  const positive = value >= 0;
  const valueColor = colored
    ? positive ? "text-emerald-600" : "text-red-500"
    : "text-slate-900";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${valueColor}`}>
        {colored && positive ? "+" : ""}
        {formatCurrency(value)}
      </p>
      {percent !== undefined && (
        <p className={`mt-1 text-sm ${valueColor}`}>{formatPercent(percent)}</p>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const sectors = await portfolioRepository.getSectors().catch(() => []);
  const fetchedAt = new Date().toLocaleTimeString("en-IN");

  const totalInvestment = sectors.reduce((s, sec) => s + sec.totalInvestment, 0);
  const totalValue = sectors.reduce((s, sec) => s + sec.totalPresentValue, 0);
  const totalGainLoss = sectors.reduce((s, sec) => s + sec.totalGainLoss, 0);
  const totalGainLossPct =
    totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* AutoRefresh is the only client component — just triggers router.refresh() */}
      <AutoRefresh interval={15_000} />

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Portfolio Dashboard</h1>
            <p className="text-xs text-slate-400">Live NSE data · 15s auto-refresh</p>
          </div>
          <p className="text-xs text-slate-400">Updated {fetchedAt}</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard label="Total Investment" value={totalInvestment} />
          <SummaryCard label="Present Value" value={totalValue} />
          <SummaryCard
            label="Total Gain / Loss"
            value={totalGainLoss}
            percent={totalGainLossPct}
            colored
          />
        </div>

        {sectors.map((sector) => {
          const sectorGainLossPct =
            sector.totalInvestment > 0
              ? (sector.totalGainLoss / sector.totalInvestment) * 100
              : 0;

          return (
            <section key={sector.sector} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-800">
                  {sector.sector}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    {sector.holdings.length} stocks
                  </span>
                </h2>
                <div className="flex flex-wrap gap-5 text-xs text-slate-500">
                  <span>
                    Invested:{" "}
                    <strong className="text-slate-700">
                      {formatCurrency(sector.totalInvestment)}
                    </strong>
                  </span>
                  <span>
                    Value:{" "}
                    <strong className="text-slate-700">
                      {formatCurrency(sector.totalPresentValue)}
                    </strong>
                  </span>
                  <span
                    className={
                      sector.totalGainLoss >= 0 ? "text-emerald-600" : "text-red-500"
                    }
                  >
                    {sector.totalGainLoss >= 0 ? "+" : ""}
                    {formatCurrency(sector.totalGainLoss)}{" "}
                    <span className="opacity-75">
                      ({formatPercent(sectorGainLossPct)})
                    </span>
                  </span>
                </div>
              </div>
              <PortfolioTable holdings={sector.holdings} />
            </section>
          );
        })}
      </main>
    </div>
  );
}
