import Player from "../models/Player.js";

export const getPlayersByTeam = async (teamName) => {
    try {
        console.log(`🔍 Searching for team: "${teamName}"`);
        
        // Try exact match first
        let players = await Player.find({ club: teamName }).sort({ overall: -1 });
        
        // If no results, try case-insensitive search
        if (!players || players.length === 0) {
            console.log(`⚠️ No exact match, trying case-insensitive search...`);
            players = await Player.find({ 
                club: { $regex: new RegExp(`^${teamName}$`, 'i') } 
            }).sort({ overall: -1 });
        }
        
        if (!players || players.length === 0) {
            // Show available teams for debugging
            const allTeams = await Player.distinct('club');
            console.log(`Available teams:`, allTeams.slice(0, 10));
            throw new Error(`No players found for team: ${teamName}`);
        }
        
        console.log(`✅ Found ${players.length} players for "${teamName}"`);
        return players;
    } catch (error) {
        throw new Error(`Failed to fetch players for team ${teamName}: ${error.message}`);
    }
};

export const getPlayerById = async (playerId) => {
    try {
        const player = await Player.findById(playerId);
        
        if (!player) {
            throw new Error(`Player not found with ID: ${playerId}`);
        }
        
        return player;
    } catch (error) {
        throw new Error(`Failed to fetch player: ${error.message}`);
    }
};

export const getPlayerByName = async (playerName) => {
    try {
        const player = await Player.findOne({ name: playerName });
        
        if (!player) {
            throw new Error(`Player not found: ${playerName}`);
        }
        
        return player;
    } catch (error) {
        throw new Error(`Failed to fetch player: ${error.message}`);
    }
};

export const getAllPlayers = async (filters = {}) => {
    try {
        const query = {};
        
        if (filters.position) {
            query.position = filters.position;
        }
        
        if (filters.minOverall) {
            query.overall = { $gte: parseInt(filters.minOverall) };
        }
        
        if (filters.nationality) {
            query.nationality = filters.nationality;
        }
        
        if (filters.team) {
            query.club = filters.team;
        }
        
        if (filters.name) {
            query.name = { $regex: filters.name, $options: 'i' }; // Case-insensitive search
        }
        
        const players = await Player.find(query).sort({ overall: -1 });
        return players;
    } catch (error) {
        throw new Error(`Failed to fetch players: ${error.message}`);
    }
};
