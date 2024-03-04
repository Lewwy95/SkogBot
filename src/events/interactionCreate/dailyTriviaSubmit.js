const dailyTriviaSchema = require('../../models/dailyTrivia');

module.exports = async (interaction) => {
    if (!interaction.isModalSubmit()) {
        return;
    }

    if (interaction.customId !== 'modalDailyTrivia') {
        return;
    }

    const query = await dailyTriviaSchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    const answer = interaction.fields.getTextInputValue('modalInputDailyTrivia');

    query.answers.push({
        member: interaction.user.username,
        memberId: interaction.user.id,
        answer: answer
    });

    await query.save();

    interaction.followUp('Thank you. Your answer has been submitted.');
};