import { groqPredict } from "../utils/groqClient.js";

export const getMatchPrediction = async (teamA, teamB) => {
    const prompt = `
You are a football match predictor. Predict the final score for this match:

${teamA} vs ${teamB}

Respond in this exact format:
Score: X-Y
Description: [2-3 sentences describing the key moments and outcome of the match]

Example:
Score: 2-1
Description: An intense match where Barcelona dominated possession in the first half, scoring twice through clinical finishing. Real Madrid pulled one back late but couldn't find the equalizer despite sustained pressure.
`;

    const result = await groqPredict(prompt);
    return result.trim();
};
