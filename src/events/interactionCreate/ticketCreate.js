const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ticketSchema = require('../../models/ticket');

module.exports = async (interaction) => {
    if (!interaction.isButton()) {
        return;
    }

    if (interaction.customId !== 'buttonTicket') {
        return;
    }

    const query = await ticketSchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        return;
    }

    const modalTicket = new ModalBuilder()
		.setCustomId('modalTicket')
		.setTitle('Ticket Handler')

    const modalInputTicket = new TextInputBuilder()
        .setCustomId('modalInputTicket')
        .setLabel('Please describe your issue:')
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(4)
        .setMaxLength(400)

    const modalRow = new ActionRowBuilder().addComponents(modalInputTicket);
    modalTicket.addComponents(modalRow);

    await interaction.showModal(modalTicket);
};