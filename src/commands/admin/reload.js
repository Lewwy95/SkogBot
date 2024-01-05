const { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload all commands.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction, handler }) {
    // Keep the member waiting while the command is processing
    await interaction.deferReply({ ephemeral: true });

    // Reload all registered commands
    await handler.reloadCommands();

    // Follow up with the instigator
    return await interaction.followUp({ 
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setDescription('✅ All commands for instances running in this environment have been reloaded.')
        ],
        ephemeral: true
    }).catch(console.error);
};

/**
 * @type {import('commandkit').CommandOptions}
 */

const options = {
    dm_permission: false,
    userPermissions: ['Administrator']
};

module.exports = { data, run, options };