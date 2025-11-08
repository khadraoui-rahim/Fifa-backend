import mongoose from "mongoose";
import csv from "csvtojson";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Player from "../models/Player.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../.env");
console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });

const MONGO_URI = process.env.MONGO_URI;
console.log("MONGO_URI:", MONGO_URI ? "✅ Loaded" : "❌ Not found");

const importPlayers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const players = await csv().fromFile(
            path.resolve(__dirname, "../data/laliga_players_full_2324.csv")
        );

        // Map CSV fields to model schema
        const formatted = players.map(p => ({
            name: p.name,
            position: p.position,
            overall: Number(p.overall),
            age: Number(p.age),
            nationality: p.nationality,
            club: p.club,
        }));

        // Clear existing players before importing (optional)
        await Player.deleteMany({});
        console.log("🗑️  Cleared existing players");

        await Player.insertMany(formatted);
        console.log(`✅ Imported ${formatted.length} La Liga players`);
        process.exit();
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

importPlayers();
