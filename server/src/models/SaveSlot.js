import mongoose from "mongoose";

const saveSlotSchema = new mongoose.Schema({
    slotNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 3,
        unique: true
    },
    userTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    currentMatchday: {
        type: Number,
        default: 1,
        min: 1,
        max: 38
    },
    currentSeason: {
        type: Number,
        default: 1,
        min: 1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalMatchesPlayed: {
        type: Number,
        default: 0
    },
    seasonStartDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
saveSlotSchema.index({ slotNumber: 1 });
saveSlotSchema.index({ isActive: 1 });

export default mongoose.model("SaveSlot", saveSlotSchema);
