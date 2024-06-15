const { Schema, model } = require('mongoose');

// Create a new shop schema
const shopSchema = new Schema({
    guildId: { // The guild id where the shop is located
        type: String,
        required: true
    },
    items: { // Items that the shop sells
        type: Array,
        default: [{ // Default item
            name: 'Sword', 
            price: 50, 
            quantity: 10, 
            allowMultiple: false,
            username: 'Shop',
            type: 'Weapon',
            expiresAt: null
        }]
    }
}, { timestamps: true }); // Add timestamps to the schema

module.exports = model('Shop', shopSchema); // Export the shop schema so it can be used in other files