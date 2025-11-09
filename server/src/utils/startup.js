import Team from "../models/Team.js";
import Player from "../models/Player.js";

/**
 * Check if database needs initialization
 */
export const checkAndInitializeDatabase = async () => {
    try {
        console.log("🔍 Checking database status...");

        // Check if teams exist
        const teamCount = await Team.countDocuments();
        console.log(`   Teams in database: ${teamCount}`);

        // Check if players exist
        const playerCount = await Player.countDocuments();
        console.log(`   Players in database: ${playerCount}`);

        if (teamCount === 0) {
            console.log("⚠️  No teams found. Please run: npm run import-teams");
        }

        if (playerCount === 0) {
            console.log("⚠️  No players found. Please import player data.");
        }

        if (teamCount > 0 && playerCount > 0) {
            console.log("✅ Database is ready!");
        }

        console.log(""); // Empty line for readability
    } catch (error) {
        console.error("❌ Error checking database:", error.message);
    }
};

/**
 * Run startup checks and initialization
 */
export const runStartupTasks = async () => {
    console.log("\n🚀 Running startup tasks...\n");
    await checkAndInitializeDatabase();
};
