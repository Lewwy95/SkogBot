const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const redis = require('../functions/redis');
const profileSchema = require('../schemas/profiles');

async function fruitLeaderboard(client) {
    if (client === null || client === undefined) {
        console.log('fruitLeaderboard.js: Client object is null/undefined.');
        return;
    }

    const channel = await client.channels.cache.find((channel) => channel.name.includes('leaderboard'));

    if (!channel) {
        console.log('fruitLeaderboard.js: No channel with "leaderboard" exists in guild.');
        return;
    }

    const query = await profileSchema.find({ guildId: channel.guild.id });

    if (!query) {
        console.log('fruitLeaderboard.js: No user profiles found in database.');
        return;
    }

    let standings = [];
    let member;

    query.forEach(async (value) => {
        member = channel.guild.members.cache.find(member => member.id === value.userId);

        if (!member) {
            return;
        }

        standings.push({
            username: member.user.displayName,
            fruit: value.fruit
        });
    });

    standings.sort((a, b) => b.fruit - a.fruit);
    const output = standings.slice(0, 10);

    let string = '';
    let num = 1;

    output.forEach(async (value) => {
        string += `**#${num}** ${value.username} - (${value.fruit})\n`;
        num ++;
    });

    string = string.replace('undefined', '');

    if (!string) {
        console.log('fruitLeaderboard.js: No user profiles could be parsed from database.');
        return;
    }

    const cacheQuery = await redis.get(`${channel.id}_fruit`);

    const fruitRefresh = new ButtonBuilder()
        .setCustomId('fruitRefresh')
        .setEmoji('🔃')
        .setLabel('Refresh')
        .setStyle(ButtonStyle.Primary);

    const buttonRow = new ActionRowBuilder()
        .addComponents(fruitRefresh);

    const attachment = new AttachmentBuilder('src/images/leaderboardImage.png', { name: 'leaderboardImage.png' });

    if (cacheQuery) {
        const cache = await JSON.parse(cacheQuery);
        let message;

        try {
            message = await channel.messages.fetch(cache.fruitMessageId);
        } catch {
            console.log('fruitLeaderboard.js: Original leaderboard message missing in guild. Skipping');
            return;
        }
        
        await message.edit({
            embeds: [new EmbedBuilder()
                .setColor(message.embeds[0].color)
                .setTitle(`${message.embeds[0].title}`)
                .setDescription(`${message.embeds[0].description}`)
                .setThumbnail(`attachment://${attachment.name}`)
                .addFields(
                    {
                        name: message.embeds[0].data.fields[0].name,
                        value: string
                    },
                    {
                        name: 'Last Refresh',
                        value: `<t:${Math.floor(Date.now() / 1000)}:R>`
                    }
                )
            ],
            components: [buttonRow],
            files: [attachment]
        });
    } else {
        const newMessage = await channel.send({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('Fruit Leaderboard - Top 10')
                .setDescription('Who possesses the most fruit?')
                .setThumbnail(`attachment://${attachment.name}`)
                .addFields({
                    name: 'Standings',
                    value: string
                })
            ],
            components: [buttonRow],
            files: [attachment]
        });

        await redis.set(`${channel.id}_fruit`, JSON.stringify({ fruitMessageId: newMessage.id }));

        console.log('fruitLeaderboard.js: No Redis cache found. Created a new message and saved to cache.');
    }
};

module.exports = { fruitLeaderboard };