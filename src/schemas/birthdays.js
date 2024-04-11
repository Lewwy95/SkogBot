const { Schema, model } = require('mongoose');

const birthdaySchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    guildName: {
        type: String,
        default: null
    },
    birthdays: {
        type: Array,
        default: null
    }
}, { timestamps: true });

module.exports = model('Birthdays', birthdaySchema);