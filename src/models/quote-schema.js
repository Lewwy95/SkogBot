const { Schema, model } = require('mongoose');

const quoteSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    quotes: {
        type: Array,
        default: []
    }
}, { timestamps: true });

module.exports = model('quotes', quoteSchema);
