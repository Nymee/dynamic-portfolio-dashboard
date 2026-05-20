import dotenv from "dotenv";
import { Request, Response } from "express";

import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Backend running successfully",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
