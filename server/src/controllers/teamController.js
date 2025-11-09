import Team from "../models/Team.js";

/**
 * Get all teams with their names and ratings
 * @route GET /api/teams
 */
export const getAllTeams = async (req, res) => {
    try {
        // Fetch all teams, selecting only team name and rating fields
        const teams = await Team.find({}, 'team rating logo').sort({ rating: -1 });
        
        if (!teams || teams.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No teams found" 
            });
        }

        res.status(200).json({
            success: true,
            count: teams.length,
            data: teams
        });
    } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch teams",
            error: error.message
        });
    }
};

/**
 * Get team by name
 * @route GET /api/teams/:teamName
 */
export const getTeamByName = async (req, res) => {
    try {
        const { teamName } = req.params;
        
        const team = await Team.findOne({ 
            team: { $regex: new RegExp(`^${teamName}$`, 'i') } 
        });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: `Team "${teamName}" not found`
            });
        }

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        console.error("Error fetching team:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch team",
            error: error.message
        });
    }
};
