const { EmbedBuilder } = require('discord.js');
const db = require('../../index');

module.exports = async (reaction, user) => {
    // Get the starboard configuration from the database
    const result = await db.get(`${reaction.message.guild.id}_configs.starboard`);

    // If valid starboard configuration was found and the message was reacted to by a member
    if (result && !user.bot) {
        // Fetch the full message from cache if it is old
        if (reaction.partial) {
            await reaction.fetch().catch(console.error);
        }

        // If the message was reacted with a star emoji and it was not their own message
        if (reaction.emoji.name === '⭐' && reaction.message.author.id !== user.id) {
            // Fetch the starboard channel from cache
            const channel = await reaction.message.guild.channels.cache.find(c => c.id == result.channelId);

            // If a valid channel was found
            if (channel) {
                // Fetch a lot of messages from the starboard channel
                const messages = await channel.messages.fetch({ limit: 100 }).catch(console.error);

                // Check for duplicate starred messages
                const duplicate = messages.find(m => m.embeds[0].footer.text.startsWith('🪪') && m.embeds[0].footer.text.endsWith(reaction.message.id));

                // If no duplicate message was found
                if (!duplicate) {
                    // Get any potential attachments from the message
                    const content = reaction.message.content ? reaction.message.content : 'No Message';
                    const image = reaction.message.attachments.first() ? reaction.message.attachments.first().proxyURL : null;

                    // Send a message to the starboard channel
                    const msg = await channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor('Purple')
                            .setTitle('⭐ Starboard')
                            .setDescription(`<@${user.id}> starred a message from <@${reaction.message.author.id}>.`)
                            .setThumbnail(reaction.message.author.displayAvatarURL({ dynamic: true }))
                            .setImage(image)
                            .addFields({
                                name: 'Content',
                                value: `${content}`
                            }, {
                                name: "Source",
                                value: `[Click to view](https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}})`
                            })
                            .setFooter({
                                text: `🪪 ${reaction.message.id}`
                            })
                        ],
                        allowedMentions: false
                    }).catch(console.error);

                    // React to the message with a laughing emoji
                    return await msg.react('😂').catch(console.error);
                }
            }
        }
    }
};