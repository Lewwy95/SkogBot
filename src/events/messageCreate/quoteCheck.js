const quoteSchema = require('../../models/quote');

module.exports = async (message) => {
    const query = await quoteSchema.findOne({ guildId: message.guild.id });

    if (!query) {
        return;
    }

    if (message.channel.id === query.channelId && message.author.id !== message.client.user.id) {
        if (message.content.includes('"') || message.content.includes('-')) {
            message.reply('Are you trying to add a quote? You can use **/quote** for that.');
        }
    }
};