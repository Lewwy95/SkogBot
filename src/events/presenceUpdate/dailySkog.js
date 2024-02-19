const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const dailySkogSchema = require('../../models/dailySkog');

module.exports = async (oldMember, newMember) => {
    const query = await dailySkogSchema.findOne({ guildId: newMember.guild.id });

    if (!query) {
        return;
    }

    const channel = await newMember.guild.channels.cache.find(channel => channel.id === query.channelId);

    if (!channel) {
        return;
    }
    
    if (86400000 - (Date.now() - query.timestamp) <= 0) { // 24 hours
        const data = await fetch('https://meme-api.com/gimme/Djungelskog').then(res => res.json());

        await channel.send({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setImage(`${data.url}`)
            ]
        });

        await query.updateOne({ timestamp: Date.now() });
    }
};