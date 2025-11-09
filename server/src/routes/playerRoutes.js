import express from "express";
import {
    fetchPlayersByTeam,
    fetchPlayerStats,
    fetchPlayerByName,
    fetchAllPlayers,
} from "../controllers/playerController.js";

const router = express.Router();

// Get all players (with optional filters including team and name)
router.get("/players", fetchAllPlayers);

// Get all players for a specific team
router.get("/players/team/:teamName", fetchPlayersByTeam);

// Get individual player stats by ID
router.get("/players/:id", fetchPlayerStats);

export default router;
