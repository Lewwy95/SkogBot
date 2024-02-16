const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('bulkdelete')
    .setDescription('Delete messages from a text channel in bulk.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addNumberOption((option) =>
        option
            .setName('amount')
            .setDescription('The amount of messages that you want to delete.')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
    )
    .addChannelOption((option) =>
        option
            .setName('channel')
            .setDescription('The text channel that you want to delete messages from.')
            .addChannelTypes(ChannelType.GuildText)
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    await interaction.deferReply({ ephemeral: true });
        
    const amount = interaction.options.getNumber('amount');
    let channel = interaction.options.getChannel('channel');

    if (!channel) {
        channel = interaction.channel;
    }

    await channel.bulkDelete(amount, true);

    interaction.followUp(`You have deleted **${amount}** messages from the <#${channel.id}> channel.`);
};

module.exports = { data, run };