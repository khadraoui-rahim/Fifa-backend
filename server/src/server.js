import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("GROQ_API_KEY loaded:", process.env.GROQ_API_KEY ? "✅ yes" : "❌ no");

});
