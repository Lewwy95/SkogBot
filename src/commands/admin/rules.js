const { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Send the rules of the guild to a channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
        option
            .setName('channel')
            .setDescription('Select the channel that you want the bot to send the rules into.')
            .addChannelTypes(ChannelType.GuildText)
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    // Keep the member waiting while the command is processing
    await interaction.deferReply({ ephemeral: true });

    // Get the parameters from the command
    let channel = interaction.options.getChannel('channel');

    // Set the channel to be the instigator's channel if one was not provided
    if (!channel) {
        channel = interaction.channel;
    }

    // Send the message into the channel
    await channel.send({
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('🧾 Rules')
            .setDescription('Please read and follow the rules of the server at all times.')
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
            .addFields({
                name: 'Rule One',
                value: 'You must be a Rockstar Games employee.'
            }, {
                name: 'Rule Two',
                value: 'Your nickname must be something that we can recognise you by.'
            }, {
                name: 'Rule Three',
                value: 'Chatter regarding sensitive work information is not allowed.'
            }, {
                name: 'Rule Four',
                value: 'Light hearted jokes are allowed if members are on board.'
            }, {
                name: 'Rule Five',
                value: 'You will be removed from the server if you leave Rockstar Games.'
            })
        ]
    }).catch(console.error);

    // Return success to the instigator
    return interaction.followUp({ 
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setDescription(`✅ The rules have been sent to the ${channel} channel.`)
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