const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const eventSchema = require('../../models/event');

module.exports = async (interaction) => {
    if (!interaction.isButton()) {
        return;
    }

    if (interaction.customId !== 'buttonEvent') {
        return;
    }

    const query = await eventSchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        return;
    }

    const modalEvent = new ModalBuilder()
		.setCustomId('modalEvent')
		.setTitle('Ticket Handler')

    const modalInputEvent = new TextInputBuilder()
        .setCustomId('modalInputEvent')
        .setLabel('Describe your event in detail:')
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(4)
        .setMaxLength(800)

    const modalRow = new ActionRowBuilder().addComponents(modalInputEvent);
    modalEvent.addComponents(modalRow);

    await interaction.showModal(modalEvent);
};