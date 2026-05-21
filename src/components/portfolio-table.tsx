"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { EnrichedPortfolioHolding } from "@/types/portfolio";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";

const col = createColumnHelper<EnrichedPortfolioHolding>();

const columns = [
  col.accessor((row) => row.quote.companyName, {
    id: "particulars",
    header: "Particulars",
    cell: (info) => (
      <span className="font-medium text-slate-800">{info.getValue()}</span>
    ),
  }),
  col.accessor("purchasePrice", {
    header: "Purchase Price",
    cell: (info) => formatCurrency(info.getValue()),
  }),
  col.accessor("quantity", {
    header: "Qty",
  }),
  col.accessor("investment", {
    header: "Investment",
    cell: (info) => formatCurrency(info.getValue()),
  }),
  col.accessor("portfolioWeight", {
    header: "Portfolio %",
    cell: (info) => formatPercent(info.getValue(), false),
  }),
  col.accessor((row) => row.quote.exchange, {
    id: "exchange",
    header: "NSE/BSE",
    cell: (info) => (
      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
        {info.getValue()}
      </span>
    ),
  }),
  col.accessor((row) => row.quote.currentPrice, {
    id: "cmp",
    header: "CMP",
    cell: (info) => formatCurrency(info.getValue()),
  }),
  col.accessor("presentValue", {
    header: "Present Value",
    cell: (info) => formatCurrency(info.getValue()),
  }),
  col.accessor("gainLoss", {
    header: "Gain / Loss",
    cell: (info) => {
      const value = info.getValue();
      const pct = info.row.original.gainLossPercent;
      return (
        <span
          className={`font-medium ${value >= 0 ? "text-emerald-600" : "text-red-500"}`}
        >
          {value >= 0 ? "+" : ""}
          {formatCurrency(value)}{" "}
          <span className="text-xs opacity-75">({formatPercent(pct)})</span>
        </span>
      );
    },
  }),
  col.accessor((row) => row.quote.peRatio, {
    id: "peRatio",
    header: "P/E Ratio",
    cell: (info) => info.getValue()?.toFixed(2) ?? "—",
  }),
  col.accessor((row) => row.quote.earningsDate, {
    id: "earningsDate",
    header: "Latest Earnings",
    cell: (info) => formatDate(info.getValue()),
  }),
];

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
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-slate-100 bg-slate-50">
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
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
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-slate-50 transition-colors hover:bg-slate-50/70"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="whitespace-nowrap px-4 py-3 text-slate-700"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
