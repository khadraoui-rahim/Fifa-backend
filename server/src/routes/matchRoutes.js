import express from "express";
import {
    getFixtures,
    getNextMatch,
    submitMatchResult,
    playMatch
} from "../controllers/matchController.js";

const router = express.Router();

// Get fixtures for a specific matchday
router.get("/save-slots/:slotNumber/matchday/:matchday/fixtures", getFixtures);

// Get user's next match
router.get("/save-slots/:slotNumber/next-match", getNextMatch);

// Play match (simulate using Groq)
router.post("/save-slots/:slotNumber/play-match", playMatch);

// Submit user's match result (manual entry - kept for backward compatibility)
router.post("/save-slots/:slotNumber/submit-result", submitMatchResult);

export default router;