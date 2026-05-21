import axios from "axios";
import { PortfolioApiResponse, PortfolioResult } from "@/types/portfolio";
import { handleApiError } from "@/lib/errors";
import { getCache, setCache } from "@/lib/portfolio-cache";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

class PortfolioRepository {
  async getSectors(): Promise<PortfolioResult> {
    try {
      const { data } = await axios.get<PortfolioApiResponse>(
        `${BASE_URL}/api/portfolio`
      );
      if (!data.success) throw new Error(data.message ?? "API error");
      setCache(data.data);
      return { sectors: data.data, stale: false, cachedAt: null };
    } catch (error) {
      const cached = getCache();
      if (cached) {
        console.warn("[portfolio.repository] Live fetch failed, serving cache from", cached.at);
        return { sectors: cached.data, stale: true, cachedAt: cached.at };
      }
      throw handleApiError(error);
    }
  }
}

export const portfolioRepository = new PortfolioRepository();
