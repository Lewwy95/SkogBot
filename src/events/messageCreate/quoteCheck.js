const quotesSchema = require('../../models/quotes');

module.exports = async (message) => {
    try {
        const query = await quotesSchema.findOne({ guildId: message.guild.id });

        if (!query) {
            return;
        }

        if (message.channel.id === query.channelId && message.author.id !== message.client.user.id) {
            if (message.content.includes('"') || message.content.includes('-')) {
                message.reply('Are you trying to add a quote? You can use the **/quote** command for that.');
            }
        }
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};