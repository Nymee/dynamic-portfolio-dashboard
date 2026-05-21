import { EnrichedPortfolioHolding } from "@/types/portfolio";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";

// ─── Cell components (server-safe, no hooks) ────────────────────────────────

function StockCell({ name, symbol }: { name: string; symbol: string }) {
  return (
    <div>
      <p className="font-semibold text-slate-800 leading-tight truncate max-w-35">
        {name}
      </p>
      <p className="text-[10px] text-slate-400 mt-0.5">{symbol}</p>
    </div>
  );
}

function MoneyCell({ value }: { value: number }) {
  return (
    <span className="tabular-nums text-slate-700">{formatCurrency(value)}</span>
  );
}

function GainLossCell({ value, percent }: { value: number; percent: number }) {
  const positive = value >= 0;
  return (
    <div
      className={`inline-flex flex-col items-end rounded-md px-2 py-1 ${
        positive ? "bg-emerald-50" : "bg-red-50"
      }`}
    >
      <span
        className={`text-xs font-semibold tabular-nums ${
          positive ? "text-emerald-700" : "text-red-600"
        }`}
      >
        {positive ? "▲" : "▼"} {formatCurrency(Math.abs(value))}
      </span>
      <span
        className={`text-[10px] tabular-nums ${
          positive ? "text-emerald-500" : "text-red-400"
        }`}
      >
        {formatPercent(percent)}
      </span>
    </div>
  );
}

function WeightCell({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5 min-w-14">
      <div className="h-1.5 flex-1 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-400"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-slate-500">
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

function ExchangeCell({ value }: { value: string }) {
  const isNSE = value?.toUpperCase().includes("NSE");
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${
        isNSE ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
      }`}
    >
      {value}
    </span>
  );
}

function PERatioCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-300">—</span>;
  const color =
    value < 15 ? "text-emerald-600" : value < 30 ? "text-amber-600" : "text-red-500";
  return (
    <span className={`tabular-nums font-medium text-xs ${color}`}>
      {value.toFixed(1)}x
    </span>
  );
}

function DateCell({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-300">—</span>;
  return (
    <span className="text-xs text-slate-500 tabular-nums">{formatDate(value)}</span>
  );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function MobileCard({ row }: { row: EnrichedPortfolioHolding }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-slate-800">{row.quote.companyName}</p>
          <p className="text-[10px] text-slate-400">{row.symbol}</p>
        </div>
        <ExchangeCell value={row.quote.exchange} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        {[
          ["Buy Price", formatCurrency(row.purchasePrice)],
          ["Qty", String(row.quantity)],
          ["CMP", formatCurrency(row.quote.currentPrice)],
          ["Invested", formatCurrency(row.investment)],
          ["Mkt Value", formatCurrency(row.presentValue)],
          ["Weight", `${row.portfolioWeight.toFixed(1)}%`],
        ].map(([label, val]) => (
          <div key={label}>
            <p className="text-slate-400">{label}</p>
            <p className="font-medium text-slate-700">{val}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
        <GainLossCell value={row.gainLoss} percent={row.gainLossPercent} />
        <div className="text-right text-xs text-slate-500">
          <p className="text-[10px] text-slate-400">P/E · Earnings</p>
          <span><PERatioCell value={row.quote.peRatio ?? null} /></span>
          {" · "}
          <span><DateCell value={row.quote.earningsDate ?? null} /></span>
        </div>
      </div>
    </div>
  );
}

// ─── Column headers ───────────────────────────────────────────────────────────

const HEADERS = [
  "Stock", "Buy Price", "Qty", "Invested", "Weight",
  "Exch.", "CMP", "Mkt Value", "Gain / Loss", "P/E", "Earnings",
];

const COL_WIDTHS = [
  "w-[16%]", "w-[8%]", "w-[4%]", "w-[9%]", "w-[9%]",
  "w-[5%]",  "w-[8%]", "w-[9%]", "w-[12%]", "w-[6%]", "w-[8%]",
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function PortfolioTable({
  holdings,
}: {
  holdings: EnrichedPortfolioHolding[];
}) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full table-fixed text-xs">
          <colgroup>
            {COL_WIDTHS.map((w, i) => (
              <col key={i} className={w} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-slate-800">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-300"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((row, i) => (
              <tr
                key={row.symbol}
                className={`border-b border-slate-50 hover:bg-blue-50/40 transition-colors ${
                  i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                }`}
              >
                <td className="px-3 py-2.5">
                  <StockCell name={row.quote.companyName} symbol={row.symbol} />
                </td>
                <td className="px-3 py-2.5"><MoneyCell value={row.purchasePrice} /></td>
                <td className="px-3 py-2.5 tabular-nums text-slate-600">{row.quantity}</td>
                <td className="px-3 py-2.5"><MoneyCell value={row.investment} /></td>
                <td className="px-3 py-2.5"><WeightCell value={row.portfolioWeight} /></td>
                <td className="px-3 py-2.5"><ExchangeCell value={row.quote.exchange} /></td>
                <td className="px-3 py-2.5"><MoneyCell value={row.quote.currentPrice} /></td>
                <td className="px-3 py-2.5"><MoneyCell value={row.presentValue} /></td>
                <td className="px-3 py-2.5">
                  <GainLossCell value={row.gainLoss} percent={row.gainLossPercent} />
                </td>
                <td className="px-3 py-2.5">
                  <PERatioCell value={row.quote.peRatio ?? null} />
                </td>
                <td className="px-3 py-2.5">
                  <DateCell value={row.quote.earningsDate ?? null} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="grid grid-cols-1 gap-3 md:hidden sm:grid-cols-2">
        {holdings.map((row) => (
          <MobileCard key={row.symbol} row={row} />
        ))}
      </div>
    </>
  );
}
