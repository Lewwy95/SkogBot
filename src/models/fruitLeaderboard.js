const { Schema, model } = require('mongoose');

const fruitLeaderboardSchema = new Schema({
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
    parentId: {
        type: String,
        required: true,
        default: null
    }
}, { timestamps: true });

module.exports = model('Fruit Leaderboard', fruitLeaderboardSchema);