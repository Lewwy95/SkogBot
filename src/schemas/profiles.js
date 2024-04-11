const { Schema, model } = require('mongoose');

const profileSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    guildName: {
        type: String,
        default: null
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        default: null
    },
    triviaStreak: {
        type: Number,
        default: 0
    },
    fruit: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = model('Profiles', profileSchema);