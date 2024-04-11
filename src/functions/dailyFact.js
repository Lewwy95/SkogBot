const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

async function dailyFact(client) {
    if (client === null || client === undefined) {
        console.log('dailyFact.js: Client object is null/undefined.');
        return;
    }

    const channel = await client.channels.cache.find((channel) => channel.name.includes('fact'));

    if (!channel) {
        console.log('dailyFact.js: No channel with "fact" exists in guild.');
        return;
    }

    const data = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random').then(res => res.json());

    if (!data) {
        console.log('dailyFact.js: API request timed out. Skipping.');
        return;
    }

    const attachment = new AttachmentBuilder('src/images/dailyFactImage.png', { name: 'dailyFactImage.png' });

    const message = await channel.send({
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('🪧 Daily Fact')
            .setDescription(`Powered by UselessFacts API.`)
            .setThumbnail(`attachment://${attachment.name}`)
            .addFields({
                name: 'Content',
                value: data.text
            })
        ],
        files: [attachment]
    });

    await message.react('⬆️');
    message.react('⬇️');
};

module.exports = { dailyFact };