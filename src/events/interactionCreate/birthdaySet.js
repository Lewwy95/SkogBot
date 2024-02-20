const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const birthdaySchema = require('../../models/birthday');

module.exports = async (interaction) => {
    if (!interaction.isButton()) {
        return;
    }

    if (interaction.customId !== 'buttonBirthdaySet') {
        return;
    }

    const query = await birthdaySchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        return;
    }

    const modalBirthday = new ModalBuilder()
		.setCustomId('modalBirthday')
		.setTitle('Birthday Handler')

    const modalInputBirthday = new TextInputBuilder()
        .setCustomId('modalInputBirthday')
        .setLabel("Input your birthday in DD/MM/YYYY:")
        .setStyle(TextInputStyle.Short)
        .setMinLength(10)
        .setMaxLength(10)

    const modalRow = new ActionRowBuilder().addComponents(modalInputBirthday);
    modalBirthday.addComponents(modalRow);

    await interaction.showModal(modalBirthday);
};