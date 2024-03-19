const { Schema, model } = require('mongoose');

const fruitTraderSchema = new Schema({
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
    trades: {
        type: Array,
        default: []
    }
}, { timestamps: true });

module.exports = model('Fruit Trader', fruitTraderSchema);