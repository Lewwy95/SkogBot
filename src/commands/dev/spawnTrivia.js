const { PermissionFlagsBits } = require('discord.js');
const { trivia } = require('../../functions/trivia');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spawn-trivia')
        .setDescription('Spawn an instance of daily trivia.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
 
    run: ({ interaction, client }) => {
        trivia(client, 2);

        interaction.reply({
            content: 'I have spawned an instance of daily trivia.',
            ephemeral: true
        });
    }
};