# Dynamic Portfolio Dashboard

Live NSE/BSE portfolio tracker with real-time Yahoo Finance data, sector grouping, gain/loss analysis, and charts.

**Stack:** Next.js 15 (App Router) · Express · TypeScript · Tailwind CSS v4 · Recharts · yahoo-finance2

---

## Running the project

```bash
# Backend (port 4000)
cd backend && npm run dev

# Frontend (port 3000)
npm run dev
```

`.env.local` must have:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Architecture

```
Yahoo Finance API
      ↓
backend/src/providers/yahoo.provider.ts    ← only file touching yahoo-finance2
backend/src/providers/yahoo.mapper.ts      ← maps Yahoo DTO → domain StockQuote
backend/src/repositories/finance.repository.ts  ← 15s TTL in-memory cache
backend/src/services/portfolio.service.ts  ← enriches holdings, groups by sector
backend/src/controllers/portfolio.controller.ts
      ↓  HTTP GET /api/portfolio
src/repositories/portfolio.repository.ts   ← calls backend, falls back to stale cache
src/app/page.tsx                           ← server component, unstable_cache (14s)
      ↓  router.refresh() every 15s
src/components/auto-refresh.tsx            ← the only client component
```

### Two-layer cache

| Layer | Where | TTL | Purpose |
|---|---|---|---|
| Symbol cache | `finance.repository.ts` (backend) | 15s per symbol | Prevents hammering Yahoo per request |
| Page cache | `unstable_cache` in `page.tsx` (Next.js) | 14s | Serves multiple `router.refresh()` calls from cache |
| Stale fallback | `portfolio-cache.ts` (frontend) | Until next success | Serves last good data if backend is down, with disclaimer banner |

### Why server components + `router.refresh()` instead of client-side fetch

`router.refresh()` triggers a full RSC re-render on the server and streams the diff to the client — only changed nodes are patched in the DOM. The frontend has exactly one client component (`AutoRefresh`) that calls `router.refresh()` on an interval. Everything else — the table, charts data, summary cards — is server-rendered with no client JS bundle cost.

True server-push (like Phoenix LiveView) would require WebSockets. For a 15s polling interval, `router.refresh()` gives the same result without the infrastructure.

---

## Issues and fixes encountered

### 1. ESM / CommonJS conflict in backend

**Error:**
```
ECMAScript imports and exports cannot be written in a CommonJS file
under 'verbatimModuleSyntax'
```

**Cause:** `backend/package.json` was missing `"type": "module"`. TypeScript was treating the files as CommonJS while the tsconfig had `verbatimModuleSyntax` enabled, which requires ESM.

**Fix:** Added `"type": "module"` to `backend/package.json`.

---

### 2. Backend `package.json` went missing entirely

**Error:** `npm run dev` failed — no `package.json` found in backend.

**Cause:** The file was deleted or never committed.

**Fix:** Recreated `backend/package.json` and `backend/tsconfig.json` from scratch with the correct ESM config.

---

### 3. TypeScript import path extensions

**Error:**
```
Relative import paths need explicit file extensions in NodeNext resolution.
An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.
```

**Cause:** `moduleResolution: "NodeNext"` requires explicit `.js` extensions on relative imports (even for `.ts` source files). This was awkward and non-standard.

**Fix:** Changed `backend/tsconfig.json` to `moduleResolution: "Bundler"` — allows extensionless imports, which is the modern default used by Vite, esbuild, tsx, and Next.js.

---

### 4. Implicit `any` on Express handler parameters

**Error:**
```
Parameter '_req' implicitly has an 'any' type.ts(7006)
```

**Fix:** Imported and typed `Request, Response` from `express` explicitly in the controller.

---

### 5. Yahoo Finance type mismatch

**Error:**
```
Type 'Quote' is not assignable to type 'YahooQuoteResponse'.
Property 'symbol' is missing in type 'QuoteECNQuote'
but required in type 'YahooQuoteResponse'.
```

**Cause:** `yahoo-finance2` returns a union type (`Quote`) across many exchange types. Not all subtypes in the union include every field we expected.

**Fix:** Added `as Promise<YahooQuoteResponse>` assertion in `yahoo.provider.ts`. The provider is the only place that touches the external library type — the rest of the app uses the domain `StockQuote` type.

---

### 6. Missing `portfolio.types.ts`

**Error:**
```
Cannot find module '../types/portfolio.types' or its corresponding type declarations.
```

**Cause:** The file was referenced but never created.

**Fix:** Created `backend/src/types/portfolio.types.ts` with all domain interfaces (`StockQuote`, `PortfolioHolding`, `EnrichedPortfolioHolding`, `SectorSummary`).

---

### 7. Crash on unknown stock symbols

**Error:**
```
Cannot read properties of undefined (reading 'symbol')
```

**Cause:** Yahoo Finance returns `undefined` for symbols it doesn't recognise. The service was trying to access `.symbol` on the result without a null check.

**Fix:** `finance.repository.ts` returns `null` when the quote is undefined or the fetch throws. `portfolio.service.ts` filters out `null` results before enriching:
```ts
const enriched = results.filter((h) => h !== null)
```

On error, the repository also returns the stale cache entry rather than dropping the stock entirely.

---

### 8. Hydration mismatch — timestamp

**Error:**
```
A tree hydrated but some attributes of the server rendered HTML didn't match.
```

**Cause (first instance):** `useState(new Date())` runs on the server during SSR and again on the client — the two timestamps differ by milliseconds, causing a mismatch.

**Fix:** Changed to `useState<Date | null>(null)` with `useEffect(() => setLastUpdated(new Date()), [])` so the date is only set client-side after hydration.

---

### 9. Hydration mismatch — browser extension

**Cause (second instance):** ColorZilla (browser extension) injects `cz-shortcut-listen="true"` onto `<body>` after the server renders it, creating a server/client attribute mismatch.

**Fix:** Added `suppressHydrationWarning` to the `<body>` tag in `layout.tsx`. This tells React to ignore attribute differences on that specific element without suppressing warnings for the rest of the tree.

---

### 10. `getPortfolioData` declared but never used

**Error:** TypeScript lint warning — the `unstable_cache` wrapper was defined but the page function still called `portfolioRepository.getSectors()` directly.

**Cause:** The cache wrapper was added but the call site wasn't updated.

**Fix:** Replaced the direct call with `getPortfolioData()` inside the page component.

---

### 11. Formatter wrote file but it got reverted by the formatter hook

**Cause:** A PostToolUse hook was running Prettier after every Write/Edit. The formatter modified `page.tsx` between the Read and Write, causing the write to be based on stale file content, and the formatter then reverted the file back to its old state.

**Symptom:** The write appeared to succeed but the dark glassmorphism design never appeared in the browser.

**Fix:** Retried the write with the full file content in a single operation, letting the formatter run on the new content rather than conflicting with it.

---

### 12. Recharts `formatter` TypeScript error

**Error:**
```
Type '(v: number) => [string, string]' is not assignable to type 'Formatter<ValueType, NameType>'.
Type 'undefined' is not assignable to type 'number'.
```

**Cause:** Recharts types the `formatter` callback's first argument as `ValueType | undefined` (since a tooltip entry might have no value). Passing an explicit `: number` annotation caused a type conflict.

**Fix:** Removed the explicit type annotation and cast inside the function body:
```ts
formatter={(v) => [`${(v as number).toFixed(2)}%`, "Gain / Loss"]}
```

---

### 13. Yahoo Finance rate limiting on cold start

**Problem:** `portfolio.service.ts` originally used `Promise.all` to fetch all ~22 symbols simultaneously. On a cold start (or when all cache entries expire together after 15s), this fires 22 concurrent HTTP requests to Yahoo Finance's unofficial API, which can return 429 Too Many Requests.

**Why the cache doesn't fully protect you:** The per-symbol TTL cache in `finance.repository.ts` is set to 15s — the same interval as the auto-refresh. If all 22 entries were fetched at the same time (e.g., on first load), they all expire at the same time, causing another thundering herd on the next refresh cycle.

**Fix:** Replaced `Promise.all` with a `batchedAll` utility that processes symbols in groups of 5:

```ts
const CONCURRENCY = 5;

async function batchedAll<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = await Promise.all(items.slice(i, i + concurrency).map(fn));
    results.push(...batch);
  }
  return results;
}
```

22 symbols → 5 batches of 4–5 requests each, sequential between batches. This keeps Yahoo happy while still being faster than fully sequential fetching.

---

### 14. Tailwind v4 canonical class warnings

Tailwind CSS v4 introduced cleaner canonical equivalents for several utility classes. The PostToolUse hook reported warnings for:

| Written | Canonical v4 |
|---|---|
| `bg-gradient-to-br` | `bg-linear-to-br` |
| `bg-white/[0.04]` | `bg-white/4` |
| `bg-white/[0.02]` | `bg-white/2` |
| `w-[500px]` | `w-125` |
| `h-[500px]` | `h-125` |

All were fixed as reported.

---

## Architecture decisions

### Provider → Mapper → Repository → Service

Rather than calling `yahoo-finance2` directly in business logic:
- **Provider** is the only file that imports and calls the external library. It returns the raw external DTO.
- **Mapper** transforms the external DTO into the internal domain type. Isolated here so Yahoo can be swapped for another source without touching anything else.
- **Repository** owns the cache and error handling. Returns domain types only.
- **Service** contains business logic (enrichment, sector grouping, weight calculation). Never touches external APIs.

### Frontend repository pattern

`src/repositories/portfolio.repository.ts` wraps the HTTP call and owns the stale-cache fallback. The page component never calls `axios` directly — it calls the repository, which decides whether to return fresh data, stale data with a disclaimer, or throw.

### Mock portfolio data

`backend/src/data/mockPortfolio.ts` contains real holdings (Priyanshu's portfolio) used as the static dataset. This is intentional for the assignment — the "user data" is separate from market data. Yahoo Finance only provides live prices; the purchase price, quantity, and sector come from this file.

```
Financial:  HDFCBANK.NS, BAJFINANCE.NS, ICICIBANK.NS, BAJAJHFL.NS
Tech:       AFFLE.NS, LTIM.NS, KPITTECH.NS, TATATECH.NS, TANLA.NS
Consumer:   DMART.NS, TATACONSUM.NS, PIDILITIND.NS
Power:      TATAPOWER.NS, KPIGREEN.NS, SUZLON.NS
Pipe:       HARIOMPIPE.NS, ASTRAL.NS, POLYCAB.NS
Others:     CLEANSCI.NS, DEEPAKNITR.NS, FINEORG.NS, GRAVITA.NS, SBILIFE.NS
```
