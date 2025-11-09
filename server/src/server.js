import app from "./app.js";
import connectDB from "./config/db.js";
import { runStartupTasks } from "./utils/startup.js";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and run startup tasks
const startServer = async () => {
    await connectDB();
    await runStartupTasks();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log("GROQ_API_KEY loaded:", process.env.GROQ_API_KEY ? "✅ yes" : "❌ no");
    });
};

startServer();
