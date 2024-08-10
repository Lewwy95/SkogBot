const accountSchema = require('../../models/account-schema');

module.exports = async (oldMember, newMember) => {
    // Here we check if the user is not the bot and create an account for the user if it doesn't exist.
    if (newMember.user.id !== newMember.client.user.id) {
        await accountSchema.findOne({ guildId: newMember.guild.id, userId: newMember.user.id }) || await accountSchema.create({ guildId: newMember.guild.id, userId: newMember.user.id, username: newMember.user.username });
    }
};