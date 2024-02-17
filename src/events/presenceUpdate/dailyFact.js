const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const dailyFactSchema = require('../../models/dailyFact');

module.exports = async (oldMember, newMember) => {
    const query = await dailyFactSchema.findOne({ guildId: newMember.guild.id });

    if (!query) {
        return;
    }

    const channel = await newMember.guild.channels.cache.find(channel => channel.id === query.channelId);

    if (!channel) {
        return;
    }
    
    if (86400000 - (Date.now() - query.timestamp) <= 0) { // 24 hours
        const data = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random').then(res => res.json());

        await channel.send({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('🔍 Daily Fact')
                .setDescription(`Powered by UselessFacts API.`)
                .setThumbnail(newMember.client.user.displayAvatarURL({ dynamic: true }))
                .addFields({
                    name: 'Content',
                    value: `${data.text}`
                })
            ]
        });

        await query.updateOne({ timestamp: Date.now() });
    }
};