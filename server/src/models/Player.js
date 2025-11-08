import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
        enum: ["GK", "DEF", "MID", "FWD"],
    },
    overall: {
        type: Number,
        required: true,
        min: 0,
        max: 99,
    },
    age: {
        type: Number,
        required: true,
    },
    nationality: {
        type: String,
        required: true,
    },
    club: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

// Index for faster queries
playerSchema.index({ club: 1 });
playerSchema.index({ position: 1 });
playerSchema.index({ overall: -1 });

export default mongoose.model("Player", playerSchema);
