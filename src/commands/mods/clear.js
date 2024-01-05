const { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');

const data = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete messages in bulk from a channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addNumberOption((option) =>
        option
            .setName('amount')
            .setDescription('Specify the amount of messages to delete.')
            .setMinValue(1)
            .setMaxValue(99)
            .setRequired(true)
    )
    .addChannelOption((option) =>
        option
            .setName('channel')
            .setDescription('Select the channel you want to delete messages from.')
            .addChannelTypes(ChannelType.GuildText)
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction, client }) {
    // Keep the member waiting while the command is processing
    await interaction.deferReply({ ephemeral: true });

    // Get the parameters from the command
    const amount = interaction.options.getNumber('amount');
    let channel = interaction.options.getChannel('channel');

    // Set the channel to be the instigator's channel if one was not provided
    if (!channel) {
        channel = interaction.channel;
    }

    // Create a transcript of the messages that are about to be cleared
    const clearTranscript = await discordTranscripts.createTranscript(channel, { filename: `${channel.name}_${channel.id}.html`, limit: amount });

    // Delete the messages
    await channel.bulkDelete(amount, true).catch(console.error);

    // Return success to the instigator
    return await interaction.followUp({ 
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('🗑️ Messages Cleared')
            .setDescription(`You cleared \`${amount}\` messages from the ${channel} channel.`)
            .addFields({
                name: 'Transcript',
                value: 'You can download the transcript above to keep a record of the cleared messages,'
            })
        ],
        files: [clearTranscript],
        ephemeral: true
    }).catch(console.error);
};

/**
 * @type {import('commandkit').CommandOptions}
 */

const options = {
    dm_permission: false,
    userPermissions: ['ManageMessages']
};

module.exports = { data, run, options };