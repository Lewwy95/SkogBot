const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('simulatejoin')
    .setDescription('Simulate a member joining this guild.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
        option
            .setName('member')
            .setDescription('Select a member to simulate.')
            .setRequired(true)
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

function run({ interaction, client }) {
    try {
        const channel = interaction.guild.systemChannel;

        if (!channel) {
            interaction.reply({
                content: 'No welcome channel exists for this guild.',
                ephemeral: true 
            });
            return;
        }

        const user = interaction.options.getUser('member');
        const member = interaction.guild.members.cache.get(user.id);

        client.emit('guildMemberAdd', member);

        interaction.reply({
            content: `Simulated <@${member.id}> joining this guild.`,
            ephemeral: true 
        });
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};

module.exports = { data, run };