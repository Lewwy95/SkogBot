const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('deletechannel')
    .setDescription('Delete a channel from this guild.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((option) =>
        option
            .setName('channel')
            .setDescription('The channel that you want to delete.')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    try {
        await interaction.deferReply({ ephemeral: true });
        
        const channel = interaction.options.getChannel('channel');

        await channel.delete();

        if (interaction.channel && interaction.channel.id !== channel.id) {
            interaction.followUp(`The **${channel.name}** channel has been deleted.`);
        }
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};

module.exports = { data, run };