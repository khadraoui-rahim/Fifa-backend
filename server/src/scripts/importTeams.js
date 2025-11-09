import mongoose from "mongoose";
import csv from "csvtojson";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Team from "../models/Team.js";
import { getTeamLogoUrl } from "../utils/cloudinary.js";

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

        // Delete all existing teams
        await Team.deleteMany({});
        console.log("🗑️  Deleted all existing teams");

        const teams = await csv().fromFile(path.resolve(__dirname, "../data/team_ratings.csv"));

        console.log(`📥 Processing ${teams.length} teams...`);

        // Fetch logos from Cloudinary for each team
        const formatted = await Promise.all(
            teams.map(async (t) => {
                const teamName = t["Team"];
                const logo = await getTeamLogoUrl(teamName, 'fifa-simulator-laliga-teams');
                
                console.log(`${logo ? '✅' : '⚠️ '} ${teamName}: ${logo || 'No logo found'}`);
                
                return {
                    team: teamName,
                    rating: Number(t["FotMob Team Rating"]),
                    logo: logo
                };
            })
        );

        await Team.insertMany(formatted);
        console.log(`✅ Imported ${formatted.length} teams with logos`);
        process.exit();
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

importTeams();
