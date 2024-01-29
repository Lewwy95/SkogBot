const { Schema, model } = require('mongoose');

const memberProfilesSchema = new Schema({
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
    memberUsername: {
        type: String,
        required: true,
        default: null
    },
    memberId: {
        type: String,
        required: true,
        default: null
    },
    countingGameCooldown: {
        type: Date,
        default: null
    },
    countingGameContributions: {
        type: Number,
        default: 0
    },
    countingGameSuccessfulResets: {
        type: Number,
        default: 0
    },
    countingGameFailedResets: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = model('Member Profiles', memberProfilesSchema);