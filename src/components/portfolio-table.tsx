"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { EnrichedPortfolioHolding } from "@/types/portfolio";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";

// ─── Polymorphic cell components ────────────────────────────────────────────

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
        isNSE
          ? "bg-blue-100 text-blue-700"
          : "bg-orange-100 text-orange-700"
      }`}
    >
      {value}
    </span>
  );
}

function PERatioCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-300">—</span>;
  const color =
    value < 15
      ? "text-emerald-600"
      : value < 30
      ? "text-amber-600"
      : "text-red-500";
  return (
    <span className={`tabular-nums font-medium text-xs ${color}`}>
      {value.toFixed(1)}x
    </span>
  );
}

function DateCell({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-300">—</span>;
  return (
    <span className="text-xs text-slate-500 tabular-nums">
      {formatDate(value)}
    </span>
  );
}

// ─── Column definitions ──────────────────────────────────────────────────────

const col = createColumnHelper<EnrichedPortfolioHolding>();

const columns = [
  col.accessor((row) => row.quote.companyName, {
    id: "particulars",
    header: "Stock",
    cell: (info) => (
      <StockCell
        name={info.getValue()}
        symbol={info.row.original.symbol}
      />
    ),
  }),
  col.accessor("purchasePrice", {
    header: "Buy Price",
    cell: (info) => <MoneyCell value={info.getValue()} />,
  }),
  col.accessor("quantity", {
    header: "Qty",
    cell: (info) => (
      <span className="tabular-nums text-slate-600">{info.getValue()}</span>
    ),
  }),
  col.accessor("investment", {
    header: "Invested",
    cell: (info) => <MoneyCell value={info.getValue()} />,
  }),
  col.accessor("portfolioWeight", {
    header: "Weight",
    cell: (info) => <WeightCell value={info.getValue()} />,
  }),
  col.accessor((row) => row.quote.exchange, {
    id: "exchange",
    header: "Exch.",
    cell: (info) => <ExchangeCell value={info.getValue()} />,
  }),
  col.accessor((row) => row.quote.currentPrice, {
    id: "cmp",
    header: "CMP",
    cell: (info) => <MoneyCell value={info.getValue()} />,
  }),
  col.accessor("presentValue", {
    header: "Mkt Value",
    cell: (info) => <MoneyCell value={info.getValue()} />,
  }),
  col.accessor("gainLoss", {
    header: "Gain / Loss",
    cell: (info) => (
      <GainLossCell
        value={info.getValue()}
        percent={info.row.original.gainLossPercent}
      />
    ),
  }),
  col.accessor((row) => row.quote.peRatio, {
    id: "peRatio",
    header: "P/E",
    cell: (info) => <PERatioCell value={info.getValue() ?? null} />,
  }),
  col.accessor((row) => row.quote.earningsDate, {
    id: "earningsDate",
    header: "Earnings",
    cell: (info) => <DateCell value={info.getValue() ?? null} />,
  }),
];

// ─── Mobile card ─────────────────────────────────────────────────────────────

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
        <div>
          <p className="text-slate-400">Buy Price</p>
          <p className="font-medium text-slate-700">{formatCurrency(row.purchasePrice)}</p>
        </div>
        <div>
          <p className="text-slate-400">Qty</p>
          <p className="font-medium text-slate-700">{row.quantity}</p>
        </div>
        <div>
          <p className="text-slate-400">CMP</p>
          <p className="font-medium text-slate-700">{formatCurrency(row.quote.currentPrice)}</p>
        </div>
        <div>
          <p className="text-slate-400">Invested</p>
          <p className="font-medium text-slate-700">{formatCurrency(row.investment)}</p>
        </div>
        <div>
          <p className="text-slate-400">Mkt Value</p>
          <p className="font-medium text-slate-700">{formatCurrency(row.presentValue)}</p>
        </div>
        <div>
          <p className="text-slate-400">Weight</p>
          <p className="font-medium text-slate-700">{row.portfolioWeight.toFixed(1)}%</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
        <GainLossCell value={row.gainLoss} percent={row.gainLossPercent} />
        <div className="text-right">
          <p className="text-[10px] text-slate-400">P/E · Earnings</p>
          <p className="text-xs text-slate-600">
            <PERatioCell value={row.quote.peRatio ?? null} />
            {" · "}
            <DateCell value={row.quote.earningsDate ?? null} />
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function PortfolioTable({
  holdings,
}: {
  holdings: EnrichedPortfolioHolding[];
}) {
  const table = useReactTable({
    data: holdings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full table-fixed text-xs">
          <colgroup>
            <col className="w-[16%]" />
            <col className="w-[8%]" />
            <col className="w-[4%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[5%]" />
            <col className="w-[8%]" />
            <col className="w-[9%]" />
            <col className="w-[12%]" />
            <col className="w-[6%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-slate-800">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-300"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-slate-50 transition-colors hover:bg-blue-50/40 ${
                  i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2.5 text-slate-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden sm:grid-cols-2">
        {holdings.map((row) => (
          <MobileCard key={row.symbol} row={row} />
        ))}
      </div>
    </>
  );
}
