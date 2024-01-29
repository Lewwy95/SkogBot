const { Schema, model } = require('mongoose');

const openAIsSchema = new Schema({
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
    behaviour: {
        type: String,
        default: 'A friendly chat bot.'
    }
}, { timestamps: true });

module.exports = model('Open AIs', openAIsSchema);