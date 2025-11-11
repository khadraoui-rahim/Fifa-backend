import mongoose from "mongoose";

const leagueStandingSchema = new mongoose.Schema({
    saveSlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SaveSlot",
        required: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    isUserTeam: {
        type: Boolean,
        default: false
    },
    position: {
        type: Number,
        min: 1,
        max: 20
    },
    matchesPlayed: {
        type: Number,
        default: 0,
        min: 0,
        max: 38
    },
    wins: {
        type: Number,
        default: 0,
        min: 0
    },
    draws: {
        type: Number,
        default: 0,
        min: 0
    },
    losses: {
        type: Number,
        default: 0,
        min: 0
    },
    goalsFor: {
        type: Number,
        default: 0,
        min: 0
    },
    goalsAgainst: {
        type: Number,
        default: 0,
        min: 0
    },
    goalDifference: {
        type: Number,
        default: 0
    },
    points: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// Compound index to ensure unique team per save slot
leagueStandingSchema.index({ saveSlot: 1, team: 1 }, { unique: true });

// Index for faster queries
leagueStandingSchema.index({ saveSlot: 1, points: -1, goalDifference: -1 });
leagueStandingSchema.index({ saveSlot: 1, position: 1 });

// Virtual to calculate points automatically
leagueStandingSchema.pre('save', function(next) {
    // Calculate points: 3 for win, 1 for draw, 0 for loss
    this.points = (this.wins * 3) + this.draws;
    
    // Calculate goal difference
    this.goalDifference = this.goalsFor - this.goalsAgainst;
    
    next();
});

export default mongoose.model("LeagueStanding", leagueStandingSchema);