import express, { Application } from "express";
import cors from "cors";
import portfolioRoutes from "./routes/portfolio.routes";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/portfolio", portfolioRoutes);

export default app;
