const { Schema, model } = require('mongoose');

const countingGamesSchema = new Schema({
    guildName: {
        type: String,
        required: true,
        default: null
    },
    guildId: {
        type: String,
        required: true,
        default: null
    },
    channelName: {
        type: String,
        required: true,
        default: null
    },
    channelId: {
        type: String,
        required: true,
        default: null
    },
    nextNumber: {
        type: Number,
        required: true,
        default: 1
    },
    recordNumber: {
        type: Number,
        default: null
    },
    contributions: {
        type: Number,
        default: 0
    },
    successfulResets: {
        type: Number,
        default: 0
    },
    failedResets: {
        type: Number,
        default: 0
    },
    lastMember: {
        type: String,
        default: null
    },
    cooldown: {
        type: Number,
        required: true,
        default: null
    }
}, { timestamps: true });

module.exports = model('Counting Games', countingGamesSchema);