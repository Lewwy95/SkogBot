const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('createchannel')
    .setDescription('Create a channel in this guild.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
        option
            .setName('name')
            .setDescription('The name of the channel that you want to create.')
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(24)
    )
    .addStringOption((option) =>
        option
            .setName('type')
            .setDescription('The type of channel that you want to create.')
            .setRequired(true)
            .addChoices({ 
                name: 'Text',
                value: `${ChannelType.GuildText}`
            },
            {
                name: 'Voice',
                value: `${ChannelType.GuildVoice}`
            })
    )
    .addChannelOption((option) =>
        option
            .setName('parent')
            .setDescription('The text category that your channel will be placed under upon creation.')
            .addChannelTypes(ChannelType.GuildCategory)
    )
    .addNumberOption((option) =>
        option
            .setName('position')
            .setDescription('The position of the channel that you want to create.')
    )
    .addStringOption((option) =>
        option
            .setName('topic')
            .setDescription('The topic of the channel that will appear when viewing it.')
            .setMinLength(3)
            .setMaxLength(1024)
    )
    .addBooleanOption((option) =>
        option
            .setName('nsfw')
            .setDescription('Whether or not the channel will prompt a NSFW warning when focused.')
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    try {
        await interaction.deferReply({ ephemeral: true });
        
        const channelName = interaction.options.getString('name');
        const channelType = interaction.options.getString('type');
        const channelParent = interaction.options.getChannel('parent');
        const channelPosition = interaction.options.getNumber('position');
        const channelTopic = interaction.options.getString('topic');
        const channelNSFW = interaction.options.getBoolean('nsfw');

        const channel = await interaction.guild.channels.create({ 
            name: channelName,
            type: channelType ? channelType : ChannelType.GuildText,
            parent: channelParent ? channelParent : null,
            position: channelPosition ? channelPosition : null,
            topic: channelTopic ? channelTopic : null,
            nsfw: channelNSFW ? channelNSFW : null,
            defaultAutoArchiveDuration: 4320
        });

        interaction.followUp(`The <#${channel.id}> channel has been created.\n${channelParent ? `It has been placed under the **${channelParent.name}** category.` : 'It has not been placed under a category as one was not specified.'}`);
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};

module.exports = { data, run };