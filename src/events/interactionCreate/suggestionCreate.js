const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const suggestionSchema = require('../../models/suggestion');

module.exports = async (interaction) => {
    if (!interaction.isButton()) {
        return;
    }

    if (interaction.customId !== 'buttonSuggestion') {
        return;
    }

    const query = await suggestionSchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        return;
    }

    const modalSuggestion = new ModalBuilder()
		.setCustomId('modalSuggestion')
		.setTitle('Suggestion Handler')

    const modalInputSuggestion = new TextInputBuilder()
        .setCustomId('modalInputSuggestion')
        .setLabel('Please describe your suggestion:')
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(4)
        .setMaxLength(400)

    const modalRow = new ActionRowBuilder().addComponents(modalInputSuggestion);
    modalSuggestion.addComponents(modalRow);

    await interaction.showModal(modalSuggestion);
};