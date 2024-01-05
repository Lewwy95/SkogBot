const { EmbedBuilder } = require('discord.js');
const db = require('../../index');

module.exports = async (message) => {
    // Get the counting game configuration from the database
    const result = await db.get(`${message.guild.id}_configs.count`);

    // If valid counting game configuration was found and the message was deleted by a member
    if (result && !message.author?.bot) {
        // If the message was deleted in the counting game channel and was a number
        if (message.channel.id === result.channelId && !isNaN(message.content)) {
            // Return a message to the counting game channel
            return await message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('🤔 Deletion Detected')
                    .setDescription(`<@${message.author?.id}> deleted one of their numbers.`)
                    .setThumbnail(message.author?.displayAvatarURL({ dynamic: true }))
                    .addFields({
                        name: 'Number',
                        value: `\`${message.content}\``
                    })
                ],
                allowedMentions: false
            }).catch(console.error);
        }
    }
};