const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');
const ms = require('ms');
const countingGamesSchema = require('../../models/countingGames');
const openAIsSchema = require('../../models/openAIs');
const accessRequestsSchema = require('../../models/accessRequests');
const voiceCreatorsSchema = require('../../models/voiceCreators');
const quotesSchema = require('../../models/quotes');

const data = new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure multiple elements of this guild.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
        options
            .setName('countinggame')
            .setDescription('Configure a counting game for this guild.')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('Select a channel to serve as a counting game.')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText)
            )
            .addNumberOption((option) =>
                option
                    .setName('cooldown')
                    .setDescription('Select a cooldown value that members will be placed on when disrupting a counting game.')
                    .setRequired(true)
                    .addChoices(
                        { name: "5 Minutes", value: 300000 },
                        { name: "10 Minutes", value: 600000 },
                        { name: "15 Minutes", value: 900000 },
                        { name: "30 Minutes", value: 1800000 }
                    )
            )
    )
    .addSubcommand((options) =>
        options
            .setName('openai')
            .setDescription('Configure an OpenAI for this guild.')
            .addStringOption((option) =>
                option
                    .setName('behaviour')
                    .setDescription('Specify valid behaviour for an OpenAI (e.g. A friendly chat bot).')
                    .setRequired(true)
                    .setMinLength(4)
                    .setMaxLength(128)
            )
    )
    .addSubcommand((options) =>
        options
            .setName('accessrequest')
            .setDescription('Configure an access request system for this guild.')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('Select a channel to serve as an access request system.')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText)
            )
            .addRoleOption((option) =>
                option
                    .setName('verified')
                    .setDescription('Select a role to act as the Verified role.')
                    .setRequired(true)
            )
            .addRoleOption((option) =>
                option
                    .setName('moderator')
                    .setDescription('Select a role to act as the Moderator role.')
                    .setRequired(true)
            )
    )
    .addSubcommand((options) =>
        options
            .setName('voicecreator')
            .setDescription('Configure a voice creator system for this guild.')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('Select a channel to serve as the voice creator.')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildVoice)
            )
    )
    .addSubcommand((options) =>
        options
            .setName('quotes')
            .setDescription('Configure a quotes system for this guild.')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('Select a channel to serve as the quotes system.')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText)
            )
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'countinggame': {
                const channel = interaction.options.getChannel('channel');
                const cooldown = interaction.options.getNumber('cooldown');

                const query = { guildId: interaction.guild.id };
        
                const gameExists = await countingGamesSchema.exists(query);

                if (!gameExists) {
                    await countingGamesSchema.create({
                        ...query,
                        guildName: interaction.guild.name,
                        channelName: channel.name,
                        channelId: channel.id,
                        cooldown: cooldown
                    });
                } else {
                    await countingGamesSchema.updateOne({
                        ...query,
                        guildName: interaction.guild.name,
                        channelName: channel.name,
                        channelId: channel.id,
                        cooldown: cooldown
                    });
                }
        
                interaction.followUp(`A counting game has been configured to the <#${channel.id}> channel.\n\nThe cooldown value is **${ms(cooldown, { long: true })}**.`);
            }

            break;

            case 'openai': {
                const behaviour = interaction.options.getString('behaviour');

                const query = { guildId: interaction.guild.id };
        
                const openAIExists = await openAIsSchema.exists(query);

                if (!openAIExists) {
                    await openAIsSchema.create({
                        ...query,
                        guildName: interaction.guild.name,
                        behaviour: behaviour
                    });
                } else {
                    await openAIsSchema.updateOne({
                        ...query,
                        guildName: interaction.guild.name,
                        behaviour: behaviour
                    });
                }
        
                interaction.followUp(`An OpenAI has been configured with the following behaviour:\n\n**${behaviour}**`);
            }

            break;

            case 'accessrequest': {
                const channel = interaction.options.getChannel('channel');
                const verifiedRole = interaction.options.getRole('verified');
                const modRole = interaction.options.getRole('moderator');

                const query = { guildId: interaction.guild.id };
        
                const accessRequestExists = await accessRequestsSchema.exists(query);

                if (!accessRequestExists) {
                    await accessRequestsSchema.create({
                        ...query,
                        guildName: interaction.guild.name,
                        channelName: channel.name,
                        channelId: channel.id,
                        verifiedRoleName: verifiedRole.name,
                        verifiedRoleId: verifiedRole.id,
                        modRoleName: modRole.name,
                        modRoleId: modRole.id
                    });
                } else {
                    await accessRequestsSchema.updateOne({
                        ...query,
                        guildName: interaction.guild.name,
                        channelName: channel.name,
                        channelId: channel.id,
                        verifiedRoleName: verifiedRole.name,
                        verifiedRoleId: verifiedRole.id,
                        modRoleName: modRole.name,
                        modRoleId: modRole.id
                    });
                }

                const buttonAccessRequest = new ButtonKit()
                    .setLabel('Request Access')
                    .setEmoji('🔑')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('buttonAccessRequest');
 
                const buttonRow = new ActionRowBuilder().addComponents(buttonAccessRequest);

                channel.send({
                    content: 'Request access to the guild by clicking on the button below.',
                    components: [buttonRow]
                });
        
                interaction.followUp(`An access request system has been configured to the <#${channel.id}> channel.\n\nVerified Role: <@&${verifiedRole.id}>\nModerator Role: <@&${modRole.id}>`);
            }

            break;

            case 'voicecreator': {
                const channel = interaction.options.getChannel('channel');

                const query = { guildId: interaction.guild.id };
        
                const voiceCreatorExists = await voiceCreatorsSchema.exists(query);

                if (!voiceCreatorExists) {
                    await voiceCreatorsSchema.create({
                        ...query,
                        guildName: interaction.guild.name,
                        channelName: channel.name,
                        channelId: channel.id,
                        parentName: channel.parent.name,
                        parentId: channel.parent.id
                    });
                } else {
                    await voiceCreatorsSchema.updateOne({
                        ...query,
                        guildName: interaction.guild.name,
                        channelName: channel.name,
                        channelId: channel.id,
                        parentName: channel.parent.name,
                        parentId: channel.parent.id
                    });
                }
        
                interaction.followUp(`A voice creator system has been configured to the <#${channel.id}> channel.`);
            }

            break;

            case 'quotes': {
                const channel = interaction.options.getChannel('channel');

                const query = { guildId: interaction.guild.id };
        
                const quoteExists = await quotesSchema.exists(query);

                if (!quoteExists) {
                    await quotesSchema.create({
                        ...query,
                        guildName: interaction.guild.name,
                        channelName: channel.name,
                        channelId: channel.id
                    });
                } else {
                    await quotesSchema.updateOne({
                        ...query,
                        guildName: interaction.guild.name,
                        channelName: channel.name,
                        channelId: channel.id
                    });
                }
        
                interaction.followUp(`A quotes system has been configured to the <#${channel.id}> channel.`);
            }

            break;
        }
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};

module.exports = { data, run };