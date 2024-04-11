const { Schema, model } = require('mongoose');

const quoteSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    guildName: {
        type: String,
        default: null
    },
    quotes: {
        type: Array,
        default: null
    }
}, { timestamps: true });

module.exports = model('Quotes', quoteSchema);