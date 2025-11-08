import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    team: String,
    rating: Number,
});

export default mongoose.model("Team", teamSchema);
