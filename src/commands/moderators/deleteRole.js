const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('deleterole')
    .setDescription('Delete a role from this guild.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption((option) =>
        option
            .setName('role')
            .setDescription('The role that you want to delete.')
            .setRequired(true)
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    try {
        await interaction.deferReply({ ephemeral: true });
        
        const role = interaction.options.getRole('role');

        await role.delete();

        interaction.followUp(`The **${role.name}** role has been deleted.`);
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};

module.exports = { data, run };