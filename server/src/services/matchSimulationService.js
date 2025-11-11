import Match from "../models/Match.js";
import { groqPredict } from "../utils/groqClient.js";
import { updateStandingsAfterMatch } from "./leagueService.js";

/**
 * Parse score from Groq prediction response
 * @param {String} prediction - Groq prediction text
 * @returns {Object} { homeScore, awayScore, description }
 */
const parsePrediction = (prediction) => {
    try {
        // Extract score using regex (format: "Score: X-Y")
        const scoreMatch = prediction.match(/Score:\s*(\d+)-(\d+)/);
        
        if (!scoreMatch) {
            throw new Error("Could not parse score from prediction");
        }
        
        const homeScore = parseInt(scoreMatch[1]);
        const awayScore = parseInt(scoreMatch[2]);
        
        // Extract description (everything after "Description:")
        const descriptionMatch = prediction.match(/Description:\s*(.+)/s);
        const description = descriptionMatch ? descriptionMatch[1].trim() : "Match completed.";
        
        return { homeScore, awayScore, description };
    } catch (error) {
        console.error("Error parsing prediction:", error);
        // Fallback to random score if parsing fails
        return {
            homeScore: Math.floor(Math.random() * 4),
            awayScore: Math.floor(Math.random() * 4),
            description: "Match completed."
        };
    }
};

/**
 * Simulate a single match using Groq
 * @param {Object} match - Match document
 * @returns {Promise<Object>} Updated match with scores
 */
export const simulateMatch = async (match) => {
    try {
        // Populate team details if not already populated
        if (!match.homeTeam.team) {
            await match.populate('homeTeam', 'team rating');
            await match.populate('awayTeam', 'team rating');
        }
        
        const homeTeamName = match.homeTeam.team;
        const awayTeamName = match.awayTeam.team;
        const homeRating = match.homeTeam.rating;
        const awayRating = match.awayTeam.rating;
        
        console.log(`🤖 Simulating: ${homeTeamName} (${homeRating}) vs ${awayTeamName} (${awayRating})`);
        
        // Create prompt for Groq
        const prompt = `
You are a football match simulator. Simulate the final score for this La Liga match:

${homeTeamName} (Rating: ${homeRating}) vs ${awayTeamName} (Rating: ${awayRating})

Consider:
- Team ratings (higher rating = stronger team)
- Home advantage (home team slightly favored)
- Realistic La Liga scorelines (most matches are 0-3 goals per team)

Respond in this exact format:
Score: X-Y
Description: [1-2 sentences describing the match outcome]

Example:
Score: 2-1
Description: The home side dominated possession and secured all three points with clinical finishing.
`;
        
        // Get prediction from Groq
        const prediction = await groqPredict(prompt);
        const { homeScore, awayScore, description } = parsePrediction(prediction);
        
        // Update match
        match.homeScore = homeScore;
        match.awayScore = awayScore;
        match.status = "simulated";
        match.matchDescription = description;
        match.playedAt = new Date();
        
        await match.save();
        
        console.log(`✅ Simulated: ${homeTeamName} ${homeScore}-${awayScore} ${awayTeamName}`);
        
        return match;
    } catch (error) {
        console.error("Error simulating match:", error);
        throw error;
    }
};

/**
 * Simulate all AI matches for a specific matchday after user completes their match
 * @param {ObjectId} saveSlotId - The save slot ID
 * @param {Number} matchday - The matchday number
 * @returns {Promise<Array>} Array of simulated matches
 */
export const simulateMatchday = async (saveSlotId, matchday) => {
    try {
        console.log(`🎮 Starting simulation for Matchday ${matchday}...`);
        
        // Get all pending AI matches for this matchday
        const aiMatches = await Match.find({
            saveSlot: saveSlotId,
            matchday,
            isUserMatch: false,
            status: "pending"
        })
        .populate('homeTeam', 'team rating logo')
        .populate('awayTeam', 'team rating logo');
        
        if (aiMatches.length === 0) {
            console.log("✅ No AI matches to simulate");
            return [];
        }
        
        console.log(`🔄 Simulating ${aiMatches.length} AI matches...`);
        
        // Simulate each match sequentially (to avoid rate limits)
        const simulatedMatches = [];
        for (const match of aiMatches) {
            const simulatedMatch = await simulateMatch(match);
            
            // Update standings after each match
            await updateStandingsAfterMatch(
                saveSlotId,
                match.homeTeam._id,
                match.awayTeam._id,
                simulatedMatch.homeScore,
                simulatedMatch.awayScore
            );
            
            simulatedMatches.push(simulatedMatch);
            
            // Small delay to avoid rate limiting (100ms between requests)
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`✅ Matchday ${matchday} simulation complete!`);
        
        return simulatedMatches;
    } catch (error) {
        console.error("Error simulating matchday:", error);
        throw error;
    }
};