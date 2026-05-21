import axios from "axios";
import { PortfolioApiResponse, SectorSummary } from "@/types/portfolio";
import { handleApiError } from "@/lib/errors";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

class PortfolioRepository {
  async getSectors(): Promise<SectorSummary[]> {
    try {
      const { data } = await axios.get<PortfolioApiResponse>(
        `${BASE_URL}/api/portfolio`
      );
      if (!data.success) throw new Error(data.message ?? "API error");
      return data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const portfolioRepository = new PortfolioRepository();
