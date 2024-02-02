const quotesSchema = require('../../models/quotes');

module.exports = async (message) => {
    try {
        const query = { guildId: message.guild.id };

        const quoteExists = await quotesSchema.exists(query);

        if (!quoteExists) {
            return;
        }

        const data = await quotesSchema.findOne({ ...query });

        if (message.channel.id === data.channelId && message.author.id !== message.client.user.id) {
            if (message.content.includes('"') || message.content.includes('-')) {
                message.reply('Are you trying to add a quote? You can use the **/quote** command for that.');
            }
        }
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};