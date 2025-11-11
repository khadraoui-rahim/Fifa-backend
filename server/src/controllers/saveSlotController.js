import SaveSlot from "../models/SaveSlot.js";
import Team from "../models/Team.js";
import LeagueStanding from "../models/LeagueStanding.js";
import Match from "../models/Match.js";
import { initializeLeagueStandings } from "../services/leagueService.js";
import { initializeFixtures } from "../services/fixtureService.js";

/**
 * Get all save slots (1-3)
 * @route GET /api/save-slots
 */
export const getAllSaveSlots = async (req, res) => {
    try {
        // Fetch all active save slots
        const saveSlots = await SaveSlot.find({ isActive: true })
            .populate('userTeam', 'team rating logo')
            .sort({ slotNumber: 1 });

        // Create array of all 3 slots (empty or occupied)
        const allSlots = [1, 2, 3].map(slotNum => {
            const existingSlot = saveSlots.find(slot => slot.slotNumber === slotNum);
            if (existingSlot) {
                return existingSlot;
            }
            return {
                slotNumber: slotNum,
                isEmpty: true
            };
        });

        res.status(200).json({
            success: true,
            data: allSlots
        });
    } catch (error) {
        console.error("Error fetching save slots:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch save slots",
            error: error.message
        });
    }
};

/**
 * Get specific save slot by number
 * @route GET /api/save-slots/:slotNumber
 */
export const getSaveSlot = async (req, res) => {
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

        const saveSlot = await SaveSlot.findOne({ 
            slotNumber: slotNum, 
            isActive: true 
        }).populate('userTeam', 'team rating logo');

        if (!saveSlot) {
            return res.status(404).json({
                success: false,
                message: `Save slot ${slotNum} is empty`,
                isEmpty: true
            });
        }

        res.status(200).json({
            success: true,
            data: saveSlot
        });
    } catch (error) {
        console.error("Error fetching save slot:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch save slot",
            error: error.message
        });
    }
};

/**
 * Initialize a new save slot with team selection
 * @route POST /api/save-slots/:slotNumber/initialize
 * @body { teamId: string }
 */
export const initializeSaveSlot = async (req, res) => {
    try {
        const { slotNumber } = req.params;
        const { teamId } = req.body;
        const slotNum = parseInt(slotNumber);

        // Validate slot number
        if (slotNum < 1 || slotNum > 3) {
            return res.status(400).json({
                success: false,
                message: "Slot number must be between 1 and 3"
            });
        }

        // Validate team ID
        if (!teamId) {
            return res.status(400).json({
                success: false,
                message: "Team ID is required"
            });
        }

        // Check if team exists
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Check if slot already exists (active or inactive)
        const existingSlot = await SaveSlot.findOne({ 
            slotNumber: slotNum
        });

        if (existingSlot) {
            // Delete the existing slot and all related data to avoid duplicate key error
            await Promise.all([
                SaveSlot.deleteOne({ slotNumber: slotNum }),
                LeagueStanding.deleteMany({ saveSlot: existingSlot._id }),
                Match.deleteMany({ saveSlot: existingSlot._id })
            ]);
            console.log(`🗑️  Deleted existing slot ${slotNum} and related data before reinitializing`);
        }

        // Create new save slot
        const newSaveSlot = await SaveSlot.create({
            slotNumber: slotNum,
            userTeam: teamId,
            currentMatchday: 1,
            currentSeason: 1,
            isActive: true,
            totalMatchesPlayed: 0,
            seasonStartDate: new Date()
        });

        // Initialize league standings with all 20 teams
        await initializeLeagueStandings(newSaveSlot._id, teamId);

        // Initialize all fixtures (380 matches for 38 matchdays)
        await initializeFixtures(newSaveSlot._id, teamId);

        // Populate team data
        await newSaveSlot.populate('userTeam', 'team rating logo');

        res.status(201).json({
            success: true,
            message: `Save slot ${slotNum} initialized successfully with league and fixtures`,
            data: newSaveSlot
        });
    } catch (error) {
        console.error("Error initializing save slot:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initialize save slot",
            error: error.message
        });
    }
};

/**
 * Delete/clear a save slot
 * @route DELETE /api/save-slots/:slotNumber
 */
export const deleteSaveSlot = async (req, res) => {
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

        const saveSlot = await SaveSlot.findOne({ 
            slotNumber: slotNum, 
            isActive: true 
        });

        if (!saveSlot) {
            return res.status(404).json({
                success: false,
                message: `Save slot ${slotNum} is already empty`
            });
        }

        // Soft delete by marking as inactive
        saveSlot.isActive = false;
        await saveSlot.save();

        res.status(200).json({
            success: true,
            message: `Save slot ${slotNum} cleared successfully`
        });
    } catch (error) {
        console.error("Error deleting save slot:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete save slot",
            error: error.message
        });
    }
};

/**
 * Update save slot progress (matchday, matches played, etc.)
 * @route PATCH /api/save-slots/:slotNumber
 * @body { currentMatchday?: number, totalMatchesPlayed?: number }
 */
export const updateSaveSlot = async (req, res) => {
    try {
        const { slotNumber } = req.params;
        const slotNum = parseInt(slotNumber);
        const updates = req.body;

        // Validate slot number
        if (slotNum < 1 || slotNum > 3) {
            return res.status(400).json({
                success: false,
                message: "Slot number must be between 1 and 3"
            });
        }

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

        // Update allowed fields
        if (updates.currentMatchday !== undefined) {
            if (updates.currentMatchday < 1 || updates.currentMatchday > 38) {
                return res.status(400).json({
                    success: false,
                    message: "Matchday must be between 1 and 38"
                });
            }
            saveSlot.currentMatchday = updates.currentMatchday;
        }

        if (updates.totalMatchesPlayed !== undefined) {
            saveSlot.totalMatchesPlayed = updates.totalMatchesPlayed;
        }

        if (updates.currentSeason !== undefined) {
            saveSlot.currentSeason = updates.currentSeason;
        }

        await saveSlot.save();
        await saveSlot.populate('userTeam', 'team rating logo');

        res.status(200).json({
            success: true,
            message: "Save slot updated successfully",
            data: saveSlot
        });
    } catch (error) {
        console.error("Error updating save slot:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update save slot",
            error: error.message
        });
    }
};
