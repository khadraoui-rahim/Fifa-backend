import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    saveSlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SaveSlot",
        required: true
    },
    matchday: {
        type: Number,
        required: true,
        min: 1,
        max: 38
    },
    homeTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    awayTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    homeScore: {
        type: Number,
        default: null,
        min: 0
    },
    awayScore: {
        type: Number,
        default: null,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "in_progress", "completed", "simulated"],
        default: "pending"
    },
    isUserMatch: {
        type: Boolean,
        default: false
    },
    matchDescription: {
        type: String,
        default: null
    },
    playedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Compound index to ensure efficient queries
matchSchema.index({ saveSlot: 1, matchday: 1 });
matchSchema.index({ saveSlot: 1, status: 1 });
matchSchema.index({ saveSlot: 1, isUserMatch: 1, status: 1 });

// Validation: home and away teams must be different
matchSchema.pre('save', function(next) {
    if (this.homeTeam.toString() === this.awayTeam.toString()) {
        next(new Error('Home team and away team cannot be the same'));
    }
    next();
});

export default mongoose.model("Match", matchSchema);