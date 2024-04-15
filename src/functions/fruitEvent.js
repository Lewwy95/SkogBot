const { ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder, ComponentType } = require('discord.js');
const { giveFruit } = require('./giveFruit');
const schedule = require('node-schedule');

async function fruitEvent(client) {
    if (client === null || client === undefined) {
        console.log('fruitEvent.js: Client object is null/undefined.');
        return;
    }

    let channel = await client.channels.cache.filter(c => c.type === ChannelType.GuildText).random();
    channel = channel.guild.systemChannel;

    if (!channel) {
        console.log('fruitEvent.js: No system channel found in guild. Skipping.');
        return;
    }

    const messages = [
        'They have dropped some of their fruit.', 
        'Some of their fruit has fallen out of their basket.',
        'Some of their fruit has gone missing.',
        'Some of their fruit is on the floor and they can\'t reach it.'
    ];

    const amount = Math.floor(Math. random() * 10 + 1); // 1-10

    const fruitEvent = new ButtonBuilder()
        .setCustomId('fruitEvent')
        .setEmoji('👋')
        .setLabel(`Help ${channel.client.user.displayName}`)
        .setStyle(ButtonStyle.Success);

	const buttonRow = new ActionRowBuilder()
	    .addComponents(fruitEvent);

    const attachment = new AttachmentBuilder('src/images/fruitEventImage.png', { name: 'fruitEventImage.png' });

    const embed = new EmbedBuilder()
        embed.setColor('Red')
        embed.setTitle('🍍 Fruit Event')
        embed.setDescription(`${channel.client.user.displayName} is in need of aid.`)
        embed.setThumbnail(`attachment://${attachment.name}`)
        embed.addFields(
            {
                name: 'Details',
                value: `${messages[Math.floor(Math.random() * messages.length)]}`
            },
            {
                name: 'Time',
                value: `This message will expire <t:${Math.floor(Date.now() / 1000 + 60)}:R>.`
            }
        )

    const message = await channel.send({
        embeds: [embed],
        components: [buttonRow],
        files: [attachment]
    });

    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 }); // 1 Minute

    collector.on('collect', async (interaction) => {
        try {
            fruitEvent.setDisabled(true);
            message.edit({ components: [buttonRow] });

            giveFruit(channel.guild.id, null, interaction.user.id, amount);

            embed.data.description = `${channel.client.user.displayName} is no longer in need of any aid.`
            embed.data.fields[0].value = `${interaction.user.displayName} came to the rescue and earned ${amount} fruit.`

            message.edit({
                embeds: [embed],
                components: [buttonRow],
                files: [attachment]
            });

            interaction.reply({
                content: `Thanks for helping me. Please take ${amount} fruit as a reward.`,
                ephemeral: true
            });
        } catch {
            console.log('fruitEvent.js: No message could be found in guild to modify. Skipping.');
        }
    });

    collector.on('end', async () => {
        try {
            message.delete();
        } catch {
            console.log('fruitEvent.js: No message could be found in guild to delete. Skipping.');
        }

        schedule.gracefulShutdown().then(() => {
            client.emit('ready');
        });
    });
};

module.exports = { fruitEvent };