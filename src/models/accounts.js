const { Schema, model } = require('mongoose');

// Create a new accounts schema
const accountSchema = new Schema({
    guildId: { // The guild id of the account
        type: String,
        required: true
    },
    userId: { // The user id of the account
        type: String,
        required: true
    },
    username: { // The username of the account
        type: String,
        required: true
    },
    fruit: { // The fruit of the account
        type: Number,
        default: 0
    },
    inventory: { // The inventory of the account
        type: Array,
        default: []
    },
    daily: { // The daily timestamp of the account
        type: Date,
        default: null
    }
}, { timestamps: true }); // Add timestamps to the schema

module.exports = model('Accounts', accountSchema); // Export the accounts schema so it can be used in other files