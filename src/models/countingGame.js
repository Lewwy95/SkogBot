const { Schema, model } = require('mongoose');

const countingGameSchema = new Schema({
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
    },
    nextNumber: {
        type: Number,
        required: true,
        default: 1
    },
    lastMember: {
        type: String,
        required: true,
        default: 'SkogBot'
    }
}, { timestamps: true });

module.exports = model('Counting Game', countingGameSchema);