const birthdaySchema = require('../../models/birthday');

module.exports = async (interaction) => {
    if (!interaction.isModalSubmit()) {
        return;
    }

    if (interaction.customId !== 'modalBirthday') {
        return;
    }

    const query = await birthdaySchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    const birthday = interaction.fields.getTextInputValue('modalInputBirthday');

    const split = birthday.split('/');
    const birthdayDay = split[0];
    const birthdayMonth = split[1];

    query.birthdays.push({ 
        member: interaction.user.username,
        memberId: interaction.user.id,
        date: new Date(`2000-${birthdayMonth}-${birthdayDay}T00:01:00.0000`)
    });

    await query.save();

    interaction.followUp('Thank you. Your birthday has been saved to the database.');
};