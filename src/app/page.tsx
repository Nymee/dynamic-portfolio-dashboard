import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { portfolioRepository } from "@/repositories/portfolio.repository";
import { AutoRefresh } from "@/components/auto-refresh";
import PortfolioTable from "@/components/portfolio-table";
import { SectorAllocationChart } from "@/components/charts/sector-allocation-chart";
import { SectorPerformanceChart } from "@/components/charts/sector-performance-chart";
import { formatCurrency, formatPercent } from "@/lib/format";

const getPortfolioData = unstable_cache(
  () => portfolioRepository.getSectors(),
  ["portfolio-sectors"],
  { revalidate: 14 },
);

export const metadata: Metadata = {
  title: "Portfolio Dashboard",
  description:
    "Live portfolio tracker with real-time NSE stock prices, sector grouping, and gain/loss analysis.",
};

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/4 backdrop-blur-2xl border border-white/10 shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  percent,
  colored,
  icon,
  accentColor,
}: {
  label: string;
  value: number;
  percent?: number;
  colored?: boolean;
  icon: string;
  accentColor: string;
}) {
  const positive = value >= 0;
  const valueColor = colored
    ? positive
      ? "text-emerald-400"
      : "text-red-400"
    : "text-white";

  return (
    <GlassCard className="p-5 relative overflow-hidden">
      {/* top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)` }}
      />
      {/* subtle corner glow */}
      <div
        className="absolute -top-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-20"
        style={{ background: accentColor }}
      />
      <div className="relative flex items-center gap-2 mb-3">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg text-sm"
          style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
        >
          {icon}
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
      </div>
      <p className={`relative text-2xl font-bold tabular-nums ${valueColor}`}>
        {colored && positive ? "+" : ""}
        {formatCurrency(value)}
      </p>
      {percent !== undefined && (
        <p className={`mt-1 text-sm tabular-nums ${valueColor} opacity-70`}>
          {formatPercent(percent)}
        </p>
      )}
    </GlassCard>
  );
}

export default async function DashboardPage() {
  const { sectors, stale, cachedAt } = await getPortfolioData().catch(() => ({
    sectors: [],
    stale: false,
    cachedAt: null,
  }));

  const fetchedAt = new Date().toLocaleTimeString("en-IN");

  const totalInvestment = sectors.reduce(
    (s, sec) => s + sec.totalInvestment,
    0,
  );
  const totalValue = sectors.reduce((s, sec) => s + sec.totalPresentValue, 0);
  const totalGainLoss = sectors.reduce((s, sec) => s + sec.totalGainLoss, 0);
  const totalGainLossPct =
    totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

  const allocationData = sectors.map((sec) => ({
    name: sec.sector,
    value:
      totalValue > 0
        ? parseFloat(((sec.totalPresentValue / totalValue) * 100).toFixed(1))
        : 0,
  }));

  const performanceData = sectors.map((sec) => ({
    name: sec.sector,
    gainLossPct:
      sec.totalInvestment > 0
        ? parseFloat(
            ((sec.totalGainLoss / sec.totalInvestment) * 100).toFixed(2),
          )
        : 0,
  }));

  return (
    <div className="min-h-screen relative" style={{ background: "#080b14" }}>
      {/* Ambient palette glows — very subtle on near-black */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-48 -left-48 w-125 h-125 rounded-full blur-[120px] opacity-25"
          style={{ background: "#F765A3" }}
        />
        <div
          className="absolute top-1/2 -right-40 w-96 h-96 rounded-full blur-[100px] opacity-20"
          style={{ background: "#A155B9" }}
        />
        <div
          className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full blur-[100px] opacity-20"
          style={{ background: "#165BAA" }}
        />
      </div>

      <AutoRefresh interval={15_000} />

      {/* Header */}
      <header
        className="sticky top-0 z-20 backdrop-blur-2xl border-b"
        style={{
          background: "rgba(8,11,20,0.75)",
          borderColor: "rgba(255,164,182,0.08)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Portfolio Dashboard
            </h1>
            <p className="text-xs" style={{ color: "rgba(255,164,182,0.5)" }}>
              Live NSE data · 15s auto-refresh
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: "#F765A3" }}
            />
            <p className="text-xs" style={{ color: "rgba(255,164,182,0.45)" }}>
              Updated {fetchedAt}
            </p>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* Stale banner */}
        {stale && cachedAt && (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm text-amber-300 backdrop-blur"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <span className="mt-0.5 text-base">⚠</span>
            <span>
              Live data unavailable — showing cached snapshot from{" "}
              <strong>{cachedAt.toLocaleTimeString("en-IN")}</strong>. Values
              may not reflect current market prices.
            </span>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total Investment"
            value={totalInvestment}
            icon="💰"
            accentColor="#165BAA"
          />
          <SummaryCard
            label="Present Value"
            value={totalValue}
            icon="📊"
            accentColor="#A155B9"
          />
          <SummaryCard
            label="Total Gain / Loss"
            value={totalGainLoss}
            percent={totalGainLossPct}
            colored
            icon="⚡"
            accentColor="#F765A3"
          />
        </div>

        {/* Charts */}
        {sectors.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GlassCard className="p-5">
              <p className="mb-4 text-sm font-semibold text-slate-200">
                Sector Allocation
              </p>
              <SectorAllocationChart data={allocationData} />
            </GlassCard>
            <GlassCard className="p-5">
              <p className="mb-4 text-sm font-semibold text-slate-200">
                Sector Performance
              </p>
              <SectorPerformanceChart data={performanceData} />
            </GlassCard>
          </div>
        )}

        {/* Sector tables */}
        {sectors.map((sector) => {
          const sectorGainLossPct =
            sector.totalInvestment > 0
              ? (sector.totalGainLoss / sector.totalInvestment) * 100
              : 0;

          return (
            <section key={sector.sector} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-100">
                  {sector.sector}
                  <span className="ml-2 text-xs font-normal text-slate-600">
                    {sector.holdings.length} stocks
                  </span>
                </h2>
                <div className="flex flex-wrap gap-5 text-xs text-slate-500">
                  <span>
                    Invested:{" "}
                    <strong className="text-slate-300">
                      {formatCurrency(sector.totalInvestment)}
                    </strong>
                  </span>
                  <span>
                    Value:{" "}
                    <strong className="text-slate-300">
                      {formatCurrency(sector.totalPresentValue)}
                    </strong>
                  </span>
                  <span
                    className={
                      sector.totalGainLoss >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
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
