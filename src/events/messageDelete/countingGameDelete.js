const countingGamesSchema = require('../../models/countingGames');

module.exports = async (message) => {
    try {
        const query = await countingGamesSchema.findOne({ guildId: message.guild.id });

        if (!query) {
            return;
        }

        if (message.channel.id !== query.channelId) {
            return;
        }

        if (message.author.id === message.client.user.id) {
            return;
        }

        message.channel.send({
            content: `<@${message.author.id}> just deleted one of their numbers.`,
            allowedMentions: { parse: [] }
        });
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};