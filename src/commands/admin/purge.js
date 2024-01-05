const { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../index');

const data = new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purge all data from the database for the guild you run this command in.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    // Keep the member waiting while the command is processing
    await interaction.deferReply({ ephemeral: true });

    // Pull the database entries
    await db.delete(`${interaction.guild.id}_configs`);
    await db.delete(`${interaction.guild.id}_data`);
    await db.delete(`${interaction.guild.id}_members`);

    // Return success to the instigator
    return interaction.followUp({ 
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setDescription(`✅ The database has been purged for guild id \`${interaction.guild.id}\`.`)
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