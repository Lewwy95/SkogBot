const { Schema, model } = require('mongoose');

const memberProfileSchema = new Schema({
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
    memberName: {
        type: String,
        required: true,
        default: null
    },
    memberId: {
        type: String,
        required: true,
        default: null
    },
    fruit: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

module.exports = model('Member Profile', memberProfileSchema);