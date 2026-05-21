import { SectorSummary } from "@/types/portfolio";

interface CacheEntry {
  data: SectorSummary[];
  at: Date;
}

let cache: CacheEntry | null = null;

export function getCache(): CacheEntry | null {
  return cache;
}

export function setCache(data: SectorSummary[]): void {
  cache = { data, at: new Date() };
}
