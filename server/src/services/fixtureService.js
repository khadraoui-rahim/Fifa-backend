import Match from "../models/Match.js";
import Team from "../models/Team.js";

/**
 * Generate round-robin fixtures for 20 teams (38 matchdays)
 * @param {Array} teams - Array of team IDs
 * @returns {Array} Array of fixtures with matchday, home, and away teams
 */
const generateRoundRobinFixtures = (teams) => {
    const fixtures = [];
    const numTeams = teams.length;
    
    if (numTeams % 2 !== 0) {
        throw new Error("Number of teams must be even for round-robin");
    }

    // Create a copy of teams array
    const teamsCopy = [...teams];
    
    // Generate first half of season (19 matchdays)
    for (let round = 0; round < numTeams - 1; round++) {
        const matchday = round + 1;
        
        // Generate matches for this round
        for (let i = 0; i < numTeams / 2; i++) {
            const home = teamsCopy[i];
            const away = teamsCopy[numTeams - 1 - i];
            
            fixtures.push({
                matchday,
                homeTeam: home,
                awayTeam: away
            });
        }
        
        // Rotate teams (keep first team fixed, rotate others)
        teamsCopy.splice(1, 0, teamsCopy.pop());
    }
    
    // Generate second half of season (reverse fixtures for matchdays 20-38)
    const firstHalfFixtures = [...fixtures];
    firstHalfFixtures.forEach(fixture => {
        fixtures.push({
            matchday: fixture.matchday + 19,
            homeTeam: fixture.awayTeam,  // Swap home and away
            awayTeam: fixture.homeTeam
        });
    });
    
    return fixtures;
};

/**
 * Initialize all fixtures for a save slot
 * @param {ObjectId} saveSlotId - The save slot ID
 * @param {ObjectId} userTeamId - The user's team ID
 * @returns {Promise<Array>} Array of created matches
 */
export const initializeFixtures = async (saveSlotId, userTeamId) => {
    try {
        // Get all 20 teams
        const allTeams = await Team.find({});
        
        if (allTeams.length !== 20) {
            throw new Error(`Expected 20 teams, found ${allTeams.length}`);
        }

        const teamIds = allTeams.map(team => team._id);
        
        // Generate fixtures using round-robin
        const fixtures = generateRoundRobinFixtures(teamIds);
        
        // Create match documents
        const matchesData = fixtures.map(fixture => ({
            saveSlot: saveSlotId,
            matchday: fixture.matchday,
            homeTeam: fixture.homeTeam,
            awayTeam: fixture.awayTeam,
            homeScore: null,
            awayScore: null,
            status: "pending",
            isUserMatch: 
                fixture.homeTeam.toString() === userTeamId.toString() ||
                fixture.awayTeam.toString() === userTeamId.toString(),
            playedAt: null
        }));
        
        // Insert all matches
        const matches = await Match.insertMany(matchesData);
        
        console.log(`✅ Generated ${matches.length} fixtures for save slot ${saveSlotId}`);
        console.log(`   - User matches: ${matches.filter(m => m.isUserMatch).length}`);
        console.log(`   - AI matches: ${matches.filter(m => !m.isUserMatch).length}`);
        
        return matches;
    } catch (error) {
        console.error("Error initializing fixtures:", error);
        throw error;
    }
};

/**
 * Get all fixtures for a specific matchday
 * @param {ObjectId} saveSlotId - The save slot ID
 * @param {Number} matchday - The matchday number (1-38)
 * @returns {Promise<Array>} Array of matches with team details
 */
export const getMatchdayFixtures = async (saveSlotId, matchday) => {
    try {
        const matches = await Match.find({ 
            saveSlot: saveSlotId, 
            matchday 
        })
        .populate('homeTeam', 'team rating logo')
        .populate('awayTeam', 'team rating logo')
        .sort({ isUserMatch: -1 }); // User match first
        
        return matches;
    } catch (error) {
        console.error("Error fetching matchday fixtures:", error);
        throw error;
    }
};

/**
 * Get user's next match
 * @param {ObjectId} saveSlotId - The save slot ID
 * @returns {Promise<Object>} Next user match
 */
export const getUserNextMatch = async (saveSlotId) => {
    try {
        const match = await Match.findOne({ 
            saveSlot: saveSlotId, 
            isUserMatch: true,
            status: "pending"
        })
        .populate('homeTeam', 'team rating logo')
        .populate('awayTeam', 'team rating logo')
        .sort({ matchday: 1 });
        
        return match;
    } catch (error) {
        console.error("Error fetching user's next match:", error);
        throw error;
    }
};