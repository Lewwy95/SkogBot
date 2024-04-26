const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('simulate-join')
        .setDescription('Simulate yourself joining the guild for the first time.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
 
    run: ({ interaction, client }) => {
        client.emit('guildMemberAdd', interaction.member);

        interaction.reply({
            content: 'I have simulated you joining the guild for the first time.',
            ephemeral: true
        });
    }
};