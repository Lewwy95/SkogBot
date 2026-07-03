const { Schema, model } = require('mongoose');

const birthdaySchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    birthdays: {
        type: Array,
        default: []
    }
}, { timestamps: true });

module.exports = model('birthdays', birthdaySchema);
