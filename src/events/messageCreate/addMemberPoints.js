const db = require('../../index');
let { memberPoints } = require('../../config');

module.exports = async (message) => {
    // Apply points to the member when they sent a message
    if (memberPoints && !message.author.bot) {
        await db.add(`${message.guild.id}_members.${message.author.username}.points`, memberPoints);
    }
};