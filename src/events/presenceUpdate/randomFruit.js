const { ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder, ComponentType } = require('discord.js');
const { giveFruit } = require('../../functions/giveFruit');

module.exports = async (oldMember, newMember) => {
    // We'll come back to this soon
    return;

    const chance = Math.floor(Math.random() * 20 + 1);

    if (chance < 20) {
        return;
    }

    const channel = newMember.guild.channels.cache.filter(c => c.type === ChannelType.GuildText).random();

    if (!channel) {
        console.log('randomFruit.js: No channel could be found in guild. Skipping.');
        return;
    }

    const messages = [
        'I\'ve dropped some of my fruit.', 
        'Some of my fruit has fallen out of my basket.',
        'Some of my fruit has gone missing.',
        'My fruit is on the floor and I can\'t reach it.'
    ];

    const amount = Math.floor(Math. random() * 10 + 1); // 1-10

    const randomFruit = new ButtonBuilder()
        .setCustomId('randomFruit')
        .setEmoji('👋')
        .setLabel(`Help ${newMember.client.user.displayName}`)
        .setStyle(ButtonStyle.Success);

	const buttonRow = new ActionRowBuilder()
	    .addComponents(randomFruit);

    const attachment = new AttachmentBuilder('src/images/randomFruitImage.png', { name: 'randomFruitImage.png' });

    const embed = new EmbedBuilder()
        embed.setColor('Red')
        embed.setTitle('🍍 Random Fruit')
        embed.setDescription(`${newMember.client.user.displayName} is in need of aid.`)
        embed.setThumbnail(`attachment://${attachment.name}`)
        embed.addFields(
            {
                name: 'Details',
                value: `"${messages[Math.floor(Math.random() * messages.length)]}"`
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
            randomFruit.setDisabled(true);
            message.edit({ components: [buttonRow] });

            giveFruit(newMember.guild.id, null, interaction.user.id, amount);

            embed.data.description = `${newMember.client.user.displayName} is no longer in need of any aid.`
            embed.data.fields[0].value = `${interaction.user.displayName} came to the rescue and earned ${amount} fruit.`

            message.edit({
                embeds: [embed],
                components: [buttonRow],
                files: [attachment]
            });

            interaction.reply({
                content: `Thanks for helping me! Please take ${amount} fruit as a reward.`,
                ephemeral: true
            });
        } catch {
            console.log('randomFruit.js: No message could be found in guild to modify. Skipping.');
        }
    });

    collector.on('end', () => {
        try {
            message.delete();
        } catch {
            console.log('randomFruit.js: No message could be found in guild to delete. Skipping.');
        }
    });
};