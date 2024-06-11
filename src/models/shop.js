const { Schema, model } = require('mongoose');

// Create a new shop schema
const shopSchema = new Schema({
    guildId: { // The guild id of the shop
        type: String,
        required: true
    },
    items: { // The items in the shop
        type: Array,
        default: [
            { name: 'Sword', price: 100, quantity: 10 } // Default item
        ]
    }
}, { timestamps: true }); // Add timestamps to the schema

module.exports = model('Shop', shopSchema); // Export the shop schema so it can be used in other files