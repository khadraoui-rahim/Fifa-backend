import {
    getPlayersByTeam,
    getPlayerById,
    getPlayerByName,
    getAllPlayers,
} from "../services/playerService.js";

export const fetchPlayersByTeam = async (req, res) => {
    try {
        const { teamName } = req.params;
        
        if (!teamName) {
            return res.status(400).json({ error: "Team name is required" });
        }
        
        console.log(`📥 Fetching players for team: ${teamName}`);
        const players = await getPlayersByTeam(teamName);
        
        console.log(`✅ Found ${players.length} players for ${teamName}`);
        res.status(200).json({
            team: teamName,
            count: players.length,
            players,
        });
    } catch (error) {
        console.error("❌ Error fetching players by team:", error.message);
        res.status(404).json({ error: error.message });
    }
};

export const fetchPlayerStats = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: "Player ID is required" });
        }
        
        console.log(`📥 Fetching player stats for ID: ${id}`);
        const player = await getPlayerById(id);
        
        console.log(`✅ Found player: ${player.name}`);
        res.status(200).json({ player });
    } catch (error) {
        console.error("❌ Error fetching player stats:", error.message);
        res.status(404).json({ error: error.message });
    }
};

export const fetchPlayerByName = async (req, res) => {
    try {
        const { name } = req.params;
        
        if (!name) {
            return res.status(400).json({ error: "Player name is required" });
        }
        
        console.log(`📥 Fetching player: ${name}`);
        const player = await getPlayerByName(name);
        
        console.log(`✅ Found player: ${player.name}`);
        res.status(200).json({ player });
    } catch (error) {
        console.error("❌ Error fetching player by name:", error.message);
        res.status(404).json({ error: error.message });
    }
};

export const fetchAllPlayers = async (req, res) => {
    try {
        const { position, minOverall, nationality, team, name } = req.query;
        
        console.log("📥 Fetching all players with filters:", { position, minOverall, nationality, team, name });
        const players = await getAllPlayers({ position, minOverall, nationality, team, name });
        
        console.log(`✅ Found ${players.length} players`);
        res.status(200).json({
            count: players.length,
            players,
        });
    } catch (error) {
        console.error("❌ Error fetching all players:", error.message);
        res.status(500).json({ error: error.message });
    }
};
