import { getMatchPrediction } from "../services/predictService.js";

export const predictMatch = async (req, res) => {
  try {
    console.log("📥 Received prediction request:", req.body);
    const { teamA, teamB } = req.body;

    if (!teamA || !teamB) {
      return res.status(400).json({ error: "Both teamA and teamB are required" });
    }

    console.log("🔮 Generating prediction...");
    const prediction = await getMatchPrediction(teamA, teamB);
    console.log("✅ Prediction generated:", prediction);

    res.status(200).json({ prediction });
  } catch (error) {
    console.error("❌ Prediction error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ error: error.message || "Failed to generate prediction" });
  }
};
