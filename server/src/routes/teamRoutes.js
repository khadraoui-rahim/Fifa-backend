import express from "express";
import { getAllTeams, getTeamByName } from "../controllers/teamController.js";

const router = express.Router();

// Get all teams
router.get("/teams", getAllTeams);

// Get team by name
router.get("/teams/:teamName", getTeamByName);

export default router;
