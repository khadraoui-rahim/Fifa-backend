import { groqPredict } from "../utils/groqClient.js";

export const getMatchPrediction = async (teamA, teamB) => {
    const prompt = `
Predict the result of this football match:

Team A: ${teamA.name}
Attack: ${teamA.attack}, Defense: ${teamA.defense}, Form: ${teamA.form}

Team B: ${teamB.name}
Attack: ${teamB.attack}, Defense: ${teamB.defense}, Form: ${teamB.form}

Respond with a predicted score and a 1-sentence analysis.
`;

    const result = await groqPredict(prompt);
    return result;
};
