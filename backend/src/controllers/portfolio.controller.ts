import { Request, Response } from "express";
import { getPortfolioGroupedBySector } from "../services/portfolio.service";

export async function getPortfolio(_req: Request, res: Response) {
  try {
    const data = await getPortfolioGroupedBySector();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch portfolio" });
  }
}
