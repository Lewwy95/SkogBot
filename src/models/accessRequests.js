const { Schema, model } = require('mongoose');

const accessRequestsSchema = new Schema({
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
    verifiedRoleId: {
        type: String,
        required: true,
        default: null
    },
    modRoleId: {
        type: String,
        required: true,
        default: null
    },
}, { timestamps: true });

module.exports = model('Access Requests', accessRequestsSchema);