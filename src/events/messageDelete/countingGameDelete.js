const countingGamesSchema = require('../../models/countingGames');

module.exports = async (message) => {
    try {
        const query = { guildId: message.guild.id };

        const gameExists = await countingGamesSchema.exists(query);

        if (!gameExists) {
            return;
        }

        const data = await countingGamesSchema.findOne({ ...query });

        if (message.channel.id !== data.channelId) {
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