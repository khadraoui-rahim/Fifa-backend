import { getLeagueStandings } from "../services/leagueService.js";
import SaveSlot from "../models/SaveSlot.js";

/**
 * Get league standings for a specific save slot
 * @route GET /api/save-slots/:slotNumber/standings
 */
export const getStandings = async (req, res) => {
    try {
        const { slotNumber } = req.params;
        const slotNum = parseInt(slotNumber);

        // Validate slot number
        if (slotNum < 1 || slotNum > 3) {
            return res.status(400).json({
                success: false,
                message: "Slot number must be between 1 and 3"
            });
        }

        // Check if save slot exists
        const saveSlot = await SaveSlot.findOne({ 
            slotNumber: slotNum, 
            isActive: true 
        });

        if (!saveSlot) {
            return res.status(404).json({
                success: false,
                message: `Save slot ${slotNum} not found`
            });
        }

        // Get league standings
        const standings = await getLeagueStandings(saveSlot._id);

        res.status(200).json({
            success: true,
            count: standings.length,
            data: standings
        });
    } catch (error) {
        console.error("Error fetching standings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch league standings",
            error: error.message
        });
    }
};