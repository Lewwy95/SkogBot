const countingGameSchema = require('../../models/countingGame');

module.exports = async (message) => {
    const query = await countingGameSchema.findOne({ guildId: message.guild.id });

    if (!query) {
        return;
    }

    if (message.channel.id !== query.channelId) {
        return;
    }

    if (message.author.id === message.client.user.id) {
        return;
    }

    if (isNaN(message.content)) {
        message.delete();
        return;
    }

    if (message.author.username === query.lastMember) {
        message.delete();
        return;
    }

    if (Math.trunc(message.content) !== query.nextNumber) {
        message.delete();
        return;
    }

    await query.updateOne({ 
        nextNumber: Math.trunc(message.content) +1,
        lastMember: message.author.username
    });
};