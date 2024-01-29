const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('reloadcommands')
    .setDescription('Reload all application commands.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction, handler }) {
    try {
        await interaction.deferReply({ ephemeral: true });

        handler.reloadCommands().then(() => {
            interaction.followUp('All application commands have been reloaded.');
        });
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};

module.exports = { data, run };