const { Schema, model } = require('mongoose');

const voiceCreatorSchema = new Schema({
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
    channels: {
        type: Array,
        default: null
    }
}, { timestamps: true });

module.exports = model('Voice Creator', voiceCreatorSchema);