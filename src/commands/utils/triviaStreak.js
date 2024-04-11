const { SlashCommandBuilder } = require('discord.js');
const profileSchema = require('../../schemas/profiles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trivia-streak')
        .setDescription('You can check a user\'s daily trivia win streak.')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user who\'s daily trivia win streak you want to check.')
                .setRequired(true)
        ),
 
    run: async ({ interaction }) => {
        const user = interaction.options.getUser('user');

        const query = await profileSchema.findOne({ guildId: interaction.guild.id, userId: user.id });

        if (!query) {
            interaction.reply({
                content: `I can\'t seem to check if ${user.displayName} has a daily trivia win streak.`,
                ephemeral: true
            });
            return;
        }

        if (!query.triviaStreak) {
            interaction.reply({
                content: `${user.displayName} is not on a daily trivia win streak.`,
                ephemeral: true
            });
            return;
        }

        interaction.reply({
            content: `${user.displayName} is on a ${query.triviaStreak} daily trivia win streak.`,
            ephemeral: true
        });
    }
};