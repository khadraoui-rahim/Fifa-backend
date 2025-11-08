import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import predictRoutes from "./routes/predictRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", predictRoutes);

export default app;
