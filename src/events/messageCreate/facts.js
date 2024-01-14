const { EmbedBuilder } = require('discord.js');
const ms = require('ms');
const fetch = require('node-fetch');
const db = require('../../index');

module.exports = async (message) => {
    // Get the facts configuration from the database
    const result = await db.get(`${message.guild.id}_configs.facts`);

    // If valid facts configuration was found and the message wasn't from the bot
    if (result && !message.author.bot) {
        // Get the facts channel from cache
        const cachedChannel = await message.guild.channels.cache.get(result.channelId);

        // If a valid facts channel was found
        if (cachedChannel) {
            // Check if a day has passed before sending a new fact
            if (ms('1d') - (Date.now() - result.timestamp) <= 0) {
                // Try to fetch a random fact
                const data = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random').then(res => res.json());

                // Send the fact to the facts channel
                await cachedChannel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('Purple')
                        .setTitle('🔍 Fact Of The Day')
                        .setDescription(`Powered by UselessFacts API.`)
                        .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true }))
                        .addFields({
                            name: 'Content',
                            value: `${data.text}`
                        })
                    ]
                }).catch(console.error);

                // Set the new timestamp
                await db.set(`${message.guild.id}_configs.facts.timestamp`, Date.now());
            }
        }
    }
};