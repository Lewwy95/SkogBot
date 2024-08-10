const { Schema, model } = require('mongoose');

const accountSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = model('accounts', accountSchema); 