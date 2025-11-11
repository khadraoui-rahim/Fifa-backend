import SaveSlot from "../models/SaveSlot.js";
import Match from "../models/Match.js";
import { getMatchdayFixtures, getUserNextMatch } from "../services/fixtureService.js";
import { simulateMatchday, simulateMatch } from "../services/matchSimulationService.js";
import { updateStandingsAfterMatch } from "../services/leagueService.js";

/**
 * Get all fixtures for a specific matchday
 * @route GET /api/save-slots/:slotNumber/matchday/:matchday/fixtures
 */
export const getFixtures = async (req, res) => {
    try {
        const { slotNumber, matchday } = req.params;
        const slotNum = parseInt(slotNumber);
        const matchdayNum = parseInt(matchday);

        // Validate inputs
        if (slotNum < 1 || slotNum > 3) {
            return res.status(400).json({
                success: false,
                message: "Slot number must be between 1 and 3"
            });
        }

        if (matchdayNum < 1 || matchdayNum > 38) {
            return res.status(400).json({
                success: false,
                message: "Matchday must be between 1 and 38"
            });
        }

        // Get save slot
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

        // Get fixtures
        const fixtures = await getMatchdayFixtures(saveSlot._id, matchdayNum);

        res.status(200).json({
            success: true,
            matchday: matchdayNum,
            count: fixtures.length,
            data: fixtures
        });
    } catch (error) {
        console.error("Error fetching fixtures:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch fixtures",
            error: error.message
        });
    }
};

/**
 * Get user's next match
 * @route GET /api/save-slots/:slotNumber/next-match
 */
export const getNextMatch = async (req, res) => {
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

        // Get save slot
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

        // Get next match
        const nextMatch = await getUserNextMatch(saveSlot._id);

        if (!nextMatch) {
            return res.status(404).json({
                success: false,
                message: "No upcoming matches found. Season complete!"
            });
        }

        res.status(200).json({
            success: true,
            data: nextMatch
        });
    } catch (error) {
        console.error("Error fetching next match:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch next match",
            error: error.message
        });
    }
};

/**
 * Submit user's match result and trigger AI simulation
 * @route POST /api/save-slots/:slotNumber/submit-result
 * @body { matchId, homeScore, awayScore }
 */
export const submitMatchResult = async (req, res) => {
    try {
        const { slotNumber } = req.params;
        const { matchId, homeScore, awayScore } = req.body;
        const slotNum = parseInt(slotNumber);

        // Validate inputs
        if (slotNum < 1 || slotNum > 3) {
            return res.status(400).json({
                success: false,
                message: "Slot number must be between 1 and 3"
            });
        }

        if (!matchId || homeScore === undefined || awayScore === undefined) {
            return res.status(400).json({
                success: false,
                message: "matchId, homeScore, and awayScore are required"
            });
        }

        if (homeScore < 0 || awayScore < 0) {
            return res.status(400).json({
                success: false,
                message: "Scores cannot be negative"
            });
        }

        // Get save slot
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

        // Get match
        const match = await Match.findOne({
            _id: matchId,
            saveSlot: saveSlot._id,
            isUserMatch: true
        })
        .populate('homeTeam', 'team rating logo')
        .populate('awayTeam', 'team rating logo');

        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match not found or not a user match"
            });
        }

        if (match.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Match has already been completed"
            });
        }

        // Update match result
        match.homeScore = homeScore;
        match.awayScore = awayScore;
        match.status = "completed";
        match.playedAt = new Date();
        await match.save();

        // Update standings
        await updateStandingsAfterMatch(
            saveSlot._id,
            match.homeTeam._id,
            match.awayTeam._id,
            homeScore,
            awayScore
        );

        // Update save slot
        saveSlot.totalMatchesPlayed += 1;
        await saveSlot.save();

        console.log(`✅ User match completed: ${match.homeTeam.team} ${homeScore}-${awayScore} ${match.awayTeam.team}`);

        // Trigger AI simulation for remaining matches in this matchday
        console.log(`🎮 Triggering AI simulation for Matchday ${match.matchday}...`);
        const simulatedMatches = await simulateMatchday(saveSlot._id, match.matchday);

        // Check if matchday is complete, advance to next matchday
        const pendingMatchesInMatchday = await Match.countDocuments({
            saveSlot: saveSlot._id,
            matchday: match.matchday,
            status: "pending"
        });

        if (pendingMatchesInMatchday === 0) {
            // Advance to next matchday
            if (saveSlot.currentMatchday < 38) {
                saveSlot.currentMatchday += 1;
                await saveSlot.save();
                console.log(`✅ Matchday ${match.matchday} complete! Advanced to Matchday ${saveSlot.currentMatchday}`);
            } else {
                console.log(`🏆 Season complete!`);
            }
        }

        res.status(200).json({
            success: true,
            message: "Match result submitted successfully",
            data: {
                userMatch: match,
                simulatedMatches: simulatedMatches.length,
                matchdayComplete: pendingMatchesInMatchday === 0,
                nextMatchday: saveSlot.currentMatchday
            }
        });
    } catch (error) {
        console.error("Error submitting match result:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit match result",
            error: error.message
        });
    }
};

/**
 * Simulate user's match using Groq and then simulate rest of matchday
 * @route POST /api/save-slots/:slotNumber/play-match
 */
export const playMatch = async (req, res) => {
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

        // Get save slot
        const saveSlot = await SaveSlot.findOne({ slotNumber: slotNum, isActive: true });
        if (!saveSlot) {
            return res.status(404).json({
                success: false,
                message: `Save slot ${slotNum} not found`
            });
        }

        // Get user's next match
        const userMatch = await getUserNextMatch(saveSlot._id);
        if (!userMatch) {
            return res.status(404).json({
                success: false,
                message: "No pending match found for user"
            });
        }

        // Simulate user's match using Groq
        console.log(`🎮 Simulating user's match: ${userMatch.homeTeam.team} vs ${userMatch.awayTeam.team}`);
        const simulatedUserMatch = await simulateMatch(userMatch);

        // Update match status to completed
        simulatedUserMatch.status = 'completed';
        await simulatedUserMatch.save();

        // Update standings after user's match
        await updateStandingsAfterMatch(
            saveSlot._id,
            simulatedUserMatch.homeTeam._id,
            simulatedUserMatch.awayTeam._id,
            simulatedUserMatch.homeScore,
            simulatedUserMatch.awayScore
        );

        console.log(`✅ User match completed: ${simulatedUserMatch.homeScore}-${simulatedUserMatch.awayScore}`);

        // Simulate remaining AI matches for this matchday
        const simulationResults = await simulateMatchday(saveSlot._id, userMatch.matchday);

        // Check if matchday is complete and advance if needed
        const allMatchesComplete = await Match.countDocuments({
            saveSlot: saveSlot._id,
            matchday: userMatch.matchday,
            status: 'pending'
        }) === 0;

        if (allMatchesComplete && userMatch.matchday < 38) {
            saveSlot.currentMatchday += 1;
            await saveSlot.save();
        }

        res.status(200).json({
            success: true,
            message: "Match simulated and matchday completed",
            data: {
                userMatch: {
                    homeTeam: simulatedUserMatch.homeTeam,
                    awayTeam: simulatedUserMatch.awayTeam,
                    homeScore: simulatedUserMatch.homeScore,
                    awayScore: simulatedUserMatch.awayScore,
                    description: simulatedUserMatch.description
                },
                simulatedMatches: simulationResults.simulatedCount,
                matchdayComplete: allMatchesComplete,
                currentMatchday: saveSlot.currentMatchday,
                nextMatchday: allMatchesComplete ? saveSlot.currentMatchday : userMatch.matchday
            }
        });
    } catch (error) {
        console.error("Error playing match:", error);
        res.status(500).json({
            success: false,
            message: "Failed to play match",
            error: error.message
        });
    }
};