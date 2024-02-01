const { Schema, model } = require('mongoose');

const quotesSchema = new Schema({
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
    quotes: {
        type: Array,
        default: null
    }
}, { timestamps: true });

module.exports = model('Quotes', quotesSchema);