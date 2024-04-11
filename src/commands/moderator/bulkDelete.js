const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bulk-delete')
        .setDescription('Delete messages from a text channel in bulk.')
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
        ),
 
    run: async ({ interaction }) => {
        const amount = interaction.options.getNumber('amount');
        let channel = interaction.options.getChannel('channel');

        if (!channel) {
            channel = interaction.channel;
        }

        await channel.bulkDelete(amount, true);

        interaction.reply({
            content: `You have deleted ${amount} messages from the <#${channel.id}> channel.`,
            ephemeral: true
        });
    },

    options: {
        userPermissions: ['ManageMessages']
    },
};