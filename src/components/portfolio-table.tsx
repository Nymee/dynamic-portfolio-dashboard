import { EnrichedPortfolioHolding } from "@/types/portfolio";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";

// ─── Polymorphic cell components ────────────────────────────────────────────

function StockCell({ name, symbol }: { name: string; symbol: string }) {
  return (
    <div>
      <p className="font-semibold text-slate-100 leading-tight truncate max-w-35">{name}</p>
      <p className="text-[10px] text-[#FFA4B6]/50 mt-0.5">{symbol}</p>
    </div>
  );
}

function MoneyCell({ value }: { value: number }) {
  return (
    <span className="tabular-nums text-slate-300">{formatCurrency(value)}</span>
  );
}

function GainLossCell({ value, percent }: { value: number; percent: number }) {
  const positive = value >= 0;
  return (
    <div
      className={`inline-flex flex-col items-end rounded-lg px-2 py-1 ${
        positive
          ? "bg-emerald-500/10 ring-1 ring-emerald-500/25"
          : "bg-red-500/10 ring-1 ring-red-500/25"
      }`}
    >
      <span
        className={`text-xs font-semibold tabular-nums ${
          positive ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {positive ? "▲" : "▼"} {formatCurrency(Math.abs(value))}
      </span>
      <span
        className={`text-[10px] tabular-nums ${
          positive ? "text-emerald-600" : "text-red-600"
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
      <div className="h-1 flex-1 rounded-full bg-[#A155B9]/20">
        <div
          className="h-full rounded-full bg-[#A155B9]/70"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-slate-400">
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

function ExchangeCell({ value }: { value: string }) {
  const isNSE = value?.toUpperCase().includes("NSE");
  return (
    <span
      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ring-1 ${
        isNSE
          ? "bg-[#165BAA]/15 text-[#FFA4B6] ring-[#165BAA]/30"
          : "bg-[#F765A3]/15 text-[#F765A3] ring-[#F765A3]/30"
      }`}
    >
      {value}
    </span>
  );
}

function PERatioCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-600">—</span>;
  const color =
    value < 15
      ? "text-emerald-400"
      : value < 30
      ? "text-amber-400"
      : "text-red-400";
  return (
    <span className={`tabular-nums font-medium text-xs ${color}`}>
      {value.toFixed(1)}x
    </span>
  );
}

function DateCell({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-600">—</span>;
  return (
    <span className="text-xs text-slate-500 tabular-nums">{formatDate(value)}</span>
  );
}

// ─── Mobile card ─────────────────────────────────────────────────────────────

function MobileCard({ row }: { row: EnrichedPortfolioHolding }) {
  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-[#FFA4B6]/15 p-4 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-slate-100">{row.quote.companyName}</p>
          <p className="text-[10px] text-[#FFA4B6]/50">{row.symbol}</p>
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
            <p className="text-slate-500">{label}</p>
            <p className="font-medium text-slate-200">{val}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-[#FFA4B6]/10 pt-3">
        <GainLossCell value={row.gainLoss} percent={row.gainLossPercent} />
        <div className="text-right text-xs">
          <p className="text-[10px] text-slate-500">P/E · Earnings</p>
          <span><PERatioCell value={row.quote.peRatio ?? null} /></span>
          <span className="text-slate-600"> · </span>
          <span><DateCell value={row.quote.earningsDate ?? null} /></span>
        </div>
      </div>
    </div>
  );
}

// ─── Column headers ───────────────────────────────────────────────────────────

const HEADERS = [
  "Particulars", "Purchase Price", "Qty", "Investment", "Portfolio (%)",
  "NSE/BSE", "CMP", "Present Value", "Gain/Loss", "P/E Ratio", "Latest Earnings",
];

const COL_WIDTHS = [
  "w-[16%]", "w-[8%]", "w-[4%]", "w-[9%]", "w-[9%]",
  "w-[5%]",  "w-[8%]", "w-[9%]", "w-[12%]", "w-[6%]", "w-[8%]",
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function PortfolioTable({ holdings }: { holdings: EnrichedPortfolioHolding[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block rounded-2xl bg-white/5 backdrop-blur-lg border border-[#FFA4B6]/15 overflow-hidden shadow-xl">
        <table className="w-full table-fixed text-xs">
          <colgroup>
            {COL_WIDTHS.map((w, i) => <col key={i} className={w} />)}
          </colgroup>
          <thead>
            <tr className="border-b border-[#FFA4B6]/10 bg-[#A155B9]/10">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#FFA4B6]/70"
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
                className={`border-b border-[#FFA4B6]/5 transition-colors hover:bg-[#A155B9]/10 ${
                  i % 2 === 0 ? "bg-transparent" : "bg-white/2"
                }`}
              >
                <td className="px-3 py-2.5"><StockCell name={row.quote.companyName} symbol={row.symbol} /></td>
                <td className="px-3 py-2.5"><MoneyCell value={row.purchasePrice} /></td>
                <td className="px-3 py-2.5 tabular-nums text-slate-400">{row.quantity}</td>
                <td className="px-3 py-2.5"><MoneyCell value={row.investment} /></td>
                <td className="px-3 py-2.5"><WeightCell value={row.portfolioWeight} /></td>
                <td className="px-3 py-2.5"><ExchangeCell value={row.quote.exchange} /></td>
                <td className="px-3 py-2.5"><MoneyCell value={row.quote.currentPrice} /></td>
                <td className="px-3 py-2.5"><MoneyCell value={row.presentValue} /></td>
                <td className="px-3 py-2.5"><GainLossCell value={row.gainLoss} percent={row.gainLossPercent} /></td>
                <td className="px-3 py-2.5"><PERatioCell value={row.quote.peRatio ?? null} /></td>
                <td className="px-3 py-2.5"><DateCell value={row.quote.earningsDate ?? null} /></td>
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
