const { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('say')
    .setDescription('Have me send a custom message into a channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
        option
            .setName('message')
            .setDescription('Specify what message the bot will send.')
            .setRequired(true)
            .setMinLength(4)
            .setMaxLength(1024)
    )
    .addChannelOption((option) =>
        option
            .setName('channel')
            .setDescription('Select the channel that you want the bot to send your message into.')
            .addChannelTypes(ChannelType.GuildText)
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    // Keep the member waiting while the command is processing
    await interaction.deferReply({ ephemeral: true });

    // Get the parameters from the command
    const message = interaction.options.getString('message');
    let channel = interaction.options.getChannel('channel');

    // Set the channel to be the instigator's channel if one was not provided
    if (!channel) {
        channel = interaction.channel;
    }

    // Send the message into the channel
    await channel.send({ 
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('🐻 Message')
            .setDescription('Please read my message below.')
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
            .addFields({
                name: 'Message',
                value: `${message}`
            })
        ]
    }).catch(console.error);

    // Return success to the instigator
    return interaction.followUp({ 
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setDescription(`✅ The message has been sent to the ${channel} channel.`)
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