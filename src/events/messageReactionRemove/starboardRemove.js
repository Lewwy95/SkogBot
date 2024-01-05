const db = require('../../index');

module.exports = async (reaction, user) => {
    // Get the starboard configuration from the database
    const result = await db.get(`${reaction.message.guild.id}_configs.starboard`);

    // If valid starboard configuration was found and the reaction was removed by a member
    if (result && !user.bot) {
        // Fetch the full message from cache if it is old
        if (reaction.partial) {
            await reaction.fetch().catch(console.error);
        }

        // If the message was reacted to with a star emoji and it was not the member's own message
        if (reaction.emoji.name === '⭐' && reaction.message.author.id !== user.id) {
            // Fetch the starboard channel from cache
            const channel = await reaction.message.guild.channels.cache.find(c => c.id == result.channelId);

            // If a valid channel was found
            if (channel) {
                // Fetch a lot of messages from the starboard channel
                const messages = await channel.messages.fetch({ limit: 100 }).catch(console.error);

                // Check for the starred message that the member is trying to remove
                const duplicate = messages.find(m => m.embeds[0].footer.text.startsWith('🪪') && m.embeds[0].footer.text.endsWith(reaction.message.id));

                // If the message in the starboard channel was found
                if (duplicate) {
                    // Delete the message from the starboard channel if there are no reactions left on the original message
                    if (reaction.count <= 0) {
                        return await duplicate.delete().catch(console.error);
                    }
                }
            }
        }
    }
};