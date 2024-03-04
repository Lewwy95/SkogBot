const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const dailyTriviaSchema = require('../../models/dailyTrivia');

module.exports = async (interaction) => {
    if (!interaction.isButton()) {
        return;
    }

    if (interaction.customId !== 'buttonDailyTriviaSet') {
        return;
    }

    const query = await dailyTriviaSchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        return;
    }

    const modalDailyTrivia = new ModalBuilder()
		.setCustomId('modalDailyTrivia')
		.setTitle('Daily Trivia Handler')

    const modalInputDailyTrivia = new TextInputBuilder()
        .setCustomId('modalInputDailyTrivia')
        .setLabel("Please submit your answer:")
        .setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(100)

    const modalRow = new ActionRowBuilder().addComponents(modalInputDailyTrivia);
    modalDailyTrivia.addComponents(modalRow);

    await interaction.showModal(modalDailyTrivia);
};