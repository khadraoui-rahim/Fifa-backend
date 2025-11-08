import mongoose from "mongoose";
import csv from "csvtojson";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Team from "../models/Team.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../.env");
console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });

const MONGO_URI = process.env.MONGO_URI;
console.log("MONGO_URI:", MONGO_URI ? "✅ Loaded" : "❌ Not found");

const importTeams = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const teams = await csv().fromFile(path.resolve(__dirname, "../data/team_ratings.csv"));

        // Map only required fields
        const formatted = teams.map(t => ({
            team: t["Team"],
            rating: Number(t["FotMob Team Rating"]),
        }));

        await Team.insertMany(formatted);
        console.log(`✅ Imported ${formatted.length} teams`);
        process.exit();
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

importTeams();
