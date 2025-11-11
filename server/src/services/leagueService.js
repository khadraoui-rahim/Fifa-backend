import LeagueStanding from "../models/LeagueStanding.js";
import Team from "../models/Team.js";

/**
 * Initialize league standings for a save slot
 * Creates 20 entries: user's team + 19 AI teams
 * @param {ObjectId} saveSlotId - The save slot ID
 * @param {ObjectId} userTeamId - The user's selected team ID
 * @returns {Promise<Array>} Array of created league standings
 */
export const initializeLeagueStandings = async (saveSlotId, userTeamId) => {
    try {
        // Get all 20 teams from database
        const allTeams = await Team.find({});
        
        if (allTeams.length !== 20) {
            throw new Error(`Expected 20 teams in database, found ${allTeams.length}`);
        }

        // Verify user's selected team exists in the league
        const userTeamExists = allTeams.some(team => team._id.toString() === userTeamId.toString());
        if (!userTeamExists) {
            throw new Error("Selected team not found in league");
        }

        // Create league standing entries for all 20 teams
        const standingsData = allTeams.map((team, index) => ({
            saveSlot: saveSlotId,
            team: team._id,
            isUserTeam: team._id.toString() === userTeamId.toString(),
            position: index + 1, // Initial position based on team order
            matchesPlayed: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0
        }));

        // Insert all standings
        const standings = await LeagueStanding.insertMany(standingsData);
        
        console.log(`✅ Initialized league with ${standings.length} teams for save slot ${saveSlotId}`);
        
        return standings;
    } catch (error) {
        console.error("Error initializing league standings:", error);
        throw error;
    }
};

/**
 * Get league standings for a save slot, sorted by position
 * @param {ObjectId} saveSlotId - The save slot ID
 * @returns {Promise<Array>} Sorted league standings with team details
 */
export const getLeagueStandings = async (saveSlotId) => {
    try {
        const standings = await LeagueStanding.find({ saveSlot: saveSlotId })
            .populate('team', 'team rating logo')
            .sort({ points: -1, goalDifference: -1, goalsFor: -1 });

        // Update positions based on current sort
        standings.forEach((standing, index) => {
            standing.position = index + 1;
        });

        // Save updated positions
        await Promise.all(standings.map(s => s.save()));

        return standings;
    } catch (error) {
        console.error("Error fetching league standings:", error);
        throw error;
    }
};

/**
 * Update standings after a match result
 * @param {ObjectId} saveSlotId - The save slot ID
 * @param {ObjectId} homeTeamId - Home team ID
 * @param {ObjectId} awayTeamId - Away team ID
 * @param {Number} homeScore - Home team score
 * @param {Number} awayScore - Away team score
 */
export const updateStandingsAfterMatch = async (saveSlotId, homeTeamId, awayTeamId, homeScore, awayScore) => {
    try {
        // Get both teams' standings
        const homeStanding = await LeagueStanding.findOne({ 
            saveSlot: saveSlotId, 
            team: homeTeamId 
        });
        
        const awayStanding = await LeagueStanding.findOne({ 
            saveSlot: saveSlotId, 
            team: awayTeamId 
        });

        if (!homeStanding || !awayStanding) {
            throw new Error("Team standings not found");
        }

        // Update matches played
        homeStanding.matchesPlayed += 1;
        awayStanding.matchesPlayed += 1;

        // Update goals
        homeStanding.goalsFor += homeScore;
        homeStanding.goalsAgainst += awayScore;
        awayStanding.goalsFor += awayScore;
        awayStanding.goalsAgainst += homeScore;

        // Determine result and update W/D/L
        if (homeScore > awayScore) {
            // Home win
            homeStanding.wins += 1;
            awayStanding.losses += 1;
        } else if (homeScore < awayScore) {
            // Away win
            awayStanding.wins += 1;
            homeStanding.losses += 1;
        } else {
            // Draw
            homeStanding.draws += 1;
            awayStanding.draws += 1;
        }

        // Save both standings (pre-save hook will calculate points and GD)
        await homeStanding.save();
        await awayStanding.save();

        console.log(`✅ Updated standings after match: ${homeScore}-${awayScore}`);
        
        // Recalculate positions for entire league
        await getLeagueStandings(saveSlotId);
        
        return { homeStanding, awayStanding };
    } catch (error) {
        console.error("Error updating standings:", error);
        throw error;
    }
};