const { EmbedBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');
const { fruitLeaderboard } = require('../../functions/fruitLeaderboard');
const fruitLeaderboardSchema = require('../../models/fruitLeaderboard');

module.exports = async (interaction) => {
    if (!interaction.isButton()) {
        return;
    }

    if (interaction.customId !== 'buttonFruitLeaderboardRefresh') {
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    const query = await fruitLeaderboardSchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        interaction.followUp('The fruit leaderboard is currently offline.');
        return;
    }

    const channel = interaction.guild.channels.cache.find(channel => channel.id === query.channelId);

    if (!channel) {
        interaction.followUp('The fruit leaderboard is currently offline.');
        return;
    }

    await interaction.deleteReply();

    await channel.bulkDelete(1, true);

    const leaderboard = await fruitLeaderboard(interaction.guild.id);

    const buttonFruitLeaderboardRefresh = new ButtonKit()
        .setLabel('Refresh')
        .setEmoji('🔃')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('buttonFruitLeaderboardRefresh');

    const buttonRow = new ActionRowBuilder().addComponents(buttonFruitLeaderboardRefresh);

    await channel.send({
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('Fruit Leaderboard - Top 10')
            .setDescription('Who possesses the most fruit?')
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
            .addFields({
                name: 'Standings',
                value: leaderboard,
            })
        ],
        components: [buttonRow],
        allowedMentions: { users: [] }
    });
};