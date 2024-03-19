const { ApplicationCommandType } = require('discord.js');
const { checkTriviaStreak } = require('../../functions/checkTriviaStreak');
 
module.exports = {
    data: {
        name: 'Check Trivia Streak',
        type: ApplicationCommandType.User,
    },
 
    run: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });

        const streak = await checkTriviaStreak(interaction.guild.id, interaction.targetUser.id);

        if (!streak) {
            interaction.followUp('This member is not on a trivia winning streak.');
            return;
        }

        interaction.followUp(`This member is on a **${streak}** trivia winning streak.`);
    }
};