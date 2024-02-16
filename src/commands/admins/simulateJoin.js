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
    const user = interaction.options.getUser('member');
    const member = interaction.guild.members.cache.get(user.id);

    client.emit('guildMemberAdd', member);

    interaction.reply({
        content: `Simulated <@${member.id}> joining this guild.`,
        ephemeral: true 
    });
};

module.exports = { data, run };