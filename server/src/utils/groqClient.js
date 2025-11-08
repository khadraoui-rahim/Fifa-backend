import axios from "axios";

export const groqPredict = async (prompt) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not configured");
        }
        
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "You are a football match predictor AI." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Groq API Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.error?.message || error.message);
    }
};
