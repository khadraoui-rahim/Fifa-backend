import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import predictRoutes from "./routes/predictRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import saveSlotRoutes from "./routes/saveSlotRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", predictRoutes);
app.use("/api", playerRoutes);
app.use("/api", teamRoutes);
app.use("/api", saveSlotRoutes);
app.use("/api", matchRoutes);

export default app;
