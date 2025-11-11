import express from "express";
import {
    getAllSaveSlots,
    getSaveSlot,
    initializeSaveSlot,
    deleteSaveSlot,
    updateSaveSlot
} from "../controllers/saveSlotController.js";
import { getStandings } from "../controllers/leagueController.js";

const router = express.Router();

// Get all save slots (1-3)
router.get("/save-slots", getAllSaveSlots);

// Get specific save slot
router.get("/save-slots/:slotNumber", getSaveSlot);

// Get league standings for a save slot
router.get("/save-slots/:slotNumber/standings", getStandings);

// Initialize new save slot with team selection
router.post("/save-slots/:slotNumber/initialize", initializeSaveSlot);

// Update save slot progress
router.patch("/save-slots/:slotNumber", updateSaveSlot);

// Delete/clear save slot
router.delete("/save-slots/:slotNumber", deleteSaveSlot);

export default router;
