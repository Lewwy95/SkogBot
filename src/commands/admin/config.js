const { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const db = require('../../index');

const data = new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure various elements of this guild.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
        options
            .setName('count')
            .setDescription('Configure the counting game.')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('Select a channel to act as the counting game.')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText)
            )
    )
    .addSubcommand((options) =>
        options
            .setName('landing')
            .setDescription('Configure the channel that new members see when joining the guild.')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('Select a channel to act as the landing channel.')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText)
            )
            .addRoleOption((option) =>
                option
                    .setName('verifiedrole')
                    .setDescription('Select a role to act as the Verified role.')
                    .setRequired(true)
            )
            .addRoleOption((option) =>
                option
                    .setName('modrole')
                    .setDescription('Select a role to act as the Moderator role.')
                    .setRequired(true)
            )
    )
    .addSubcommand((options) =>
        options
            .setName('openai')
            .setDescription('Configure the OpenAI system.')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('Select a channel to act as the OpenAI channel.')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText)
            )
    )
    .addSubcommand((options) =>
        options
            .setName('starboard')
            .setDescription('Configure the starboard.')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('Select a channel to act as the starboard.')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText)
            )
    )
    .addSubcommand((options) =>
        options
            .setName('voicecreator')
            .setDescription('Configure the voice creator.')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('Select a channel to act as the voice creator.')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildVoice)
            )
    );

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    // Keep the member waiting while the command is processing
    await interaction.deferReply({ ephemeral: true });

    // Get the sub command that the instigator has used
    const subCommand = interaction.options.getSubcommand();

    switch (subCommand) {
        case 'count': {
            // Get the parameter from the command
            const channel = interaction.options.getChannel('channel');

            // Check for an existing counting game channel
            const result = await db.get(`${interaction.guild.id}_configs.count`);

            // Handle if an old channel was found
            if (result) {
                // Fetch the old counting game channel from cache
                const oldChannel = interaction.guild.channels.cache.find(c => c.id == result.channelId);

                // Revert the permissions of the old counting channel
                if (oldChannel) {
                    await oldChannel.permissionOverwrites.edit(interaction.guild.id, {
                        AddReactions: null,
                        AttachFiles: null
                    }).catch(console.error);
                }
            }

            // Get the specified channel from cache
            const newChannel = await interaction.guild.channels.fetch(channel.id);

            // Adjust the permissions of the specified channel
            await newChannel.permissionOverwrites.edit(interaction.guild.id, {
                AddReactions: false,
                AttachFiles: false
            }).catch(console.error);

            // Create a default counting game configuration
            await db.set(`${interaction.guild.id}_configs.count.channelId`, newChannel.id);

            // Follow up with the instigator
            await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription(`✅ The counting game has been configured to the <#${channel.id}> channel.`)
                ],
                ephemeral: true
            }).catch(console.error);
        }

        break;

        case 'landing': {
            // Get the parameter from the command
            const channel = interaction.options.getChannel('channel');
            const verifiedRole = interaction.options.getRole('verifiedrole');
            const modRole = interaction.options.getRole('modrole');

            // Check for an existing landing channel
            const result = await db.get(`${interaction.guild.id}_configs.landing`);

            // Handle if an old channel was found
            if (result) {
                // Fetch the old landing channel from cache
                const oldChannel = interaction.guild.channels.cache.find(c => c.id == result.channelId);

                // Revert the permissions of the old landing channel for everyone
                if (oldChannel) {
                    await oldChannel.permissionOverwrites.edit(interaction.guild.id, { 
                        ViewChannel: null, 
                        SendMessages: null 
                    }).catch(console.error);
                }

                // Revert the permissions of the old landing channel for Moderators
                if (oldChannel) {
                    await oldChannel.permissionOverwrites.edit(modRole.id, { 
                        ViewChannel: null, 
                        SendMessages: null 
                    }).catch(console.error);
                }
            }

            // Get the specified channel from cache
            const newChannel = await interaction.guild.channels.fetch(channel.id);

            // Adjust the permissions of the specified channel for everyone
            await newChannel.permissionOverwrites.edit(interaction.guild.id, { 
                ViewChannel: true, 
                SendMessages: false 
            }).catch(console.error);

            // Adjust the permissions of the specified channel for Moderators
            await newChannel.permissionOverwrites.edit(modRole.id, { 
                ViewChannel: true, 
                SendMessages: false 
            }).catch(console.error);

            // Create a default landing channel configuration
            await db.set(`${interaction.guild.id}_configs.landing.channelId`, newChannel.id);

            // Set the roles in the database
            await db.set(`${interaction.guild.id}_configs.landing.verifiedRoleId`, verifiedRole.id);
            await db.set(`${interaction.guild.id}_configs.landing.modRoleId`, modRole.id);

            // Create an access button
            const accessButton = new ButtonBuilder()
                .setLabel('Request Access')
                .setStyle(ButtonStyle.Success)
                .setCustomId('landingAccess')

            // Bundle the button into a row
            const buttonRow = new ActionRowBuilder().addComponents(accessButton);

            /*
            // THE BUTTONS ARE HANDLED IN:
            // "./src/events/interactionCreate/"
            */

            // Send a message to the channel with the buttons
            await newChannel.send({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('👋 Welcome')
                    .setDescription('Please read the rules of the server before requesting access.')
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
                ],
                components: [buttonRow]
            }).catch(console.error);

            // Follow up with the instigator
            await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription(`✅ The landing channel has been configured to the <#${channel.id}> channel.`)
                ],
                ephemeral: true
            }).catch(console.error);
        }

        break;

        case 'openai': {
            // Get the parameter from the command
            const channel = interaction.options.getChannel('channel');

            // Create a default OpenAI configuration
            await db.set(`${interaction.guild.id}_configs.openAI.channelId`, channel.id);

            // Follow up with the instigator
            await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription(`✅ The OpenAI system has been configured to the <#${channel.id}> channel.`)
                ],
                ephemeral: true
            }).catch(console.error);
        }

        break;

        case 'starboard': {
            // Get the parameter from the command
            const channel = interaction.options.getChannel('channel');

            // Check for an existing starboard channel
            const result = await db.get(`${interaction.guild.id}_configs.starboard`);

            // Handle if an old channel was found
            if (result) {
                // Fetch the old starboard channel from cache
                const oldChannel = interaction.guild.channels.cache.find(c => c.id == result.channelId);

                // Revert the permissions of the old starboard channel
                if (oldChannel) {
                    await oldChannel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null }).catch(console.error);
                }
            }

            // Get the specified channel from cache
            const newChannel = await interaction.guild.channels.fetch(channel.id);

            // Adjust the permissions of the specified channel
            await newChannel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false }).catch(console.error);

            // Create a default starboard configuration
            await db.set(`${interaction.guild.id}_configs.starboard.channelId`, newChannel.id);

            // Follow up with the instigator
            await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription(`✅ The starboard has been configured to the <#${channel.id}> channel.`)
                ],
                ephemeral: true
            }).catch(console.error);
        }

        break;

        case 'voicecreator': {
            // Get the parameter from the command
            const channel = interaction.options.getChannel('channel');

            // Check for an existing voice creator channel
            const result = await db.get(`${interaction.guild.id}_configs.voiceCreator`);

            // Handle if an old channel was found
            if (result) {
                // Fetch the old voice creator channel from cache
                const oldChannel = interaction.guild.channels.cache.find(c => c.id == result.channelId);

                // Revert the permissions of the old voice creator channel
                if (oldChannel) {
                    await oldChannel.permissionOverwrites.edit(interaction.guild.id, {
                        Speak: null,
                        Stream: null
                    }).catch(console.error);
                }
            }

            // Get the specified channel from cache
            const newChannel = await interaction.guild.channels.fetch(channel.id);

            // Adjust the permissions of the specified channel
            await newChannel.permissionOverwrites.edit(interaction.guild.id, {
                Speak: false,
                Stream: false
            }).catch(console.error);

            // Create a default voice creator configuration
            await db.set(`${interaction.guild.id}_configs.voiceCreator.channelId`, newChannel.id);
            await db.set(`${interaction.guild.id}_configs.voiceCreator.parentId`, newChannel.parent.id);

            // Follow up with the instigator
            await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription(`✅ The voice creator has been configured to the <#${channel.id}> channel.`)
                ],
                ephemeral: true
            }).catch(console.error);
        }

        break;
    }

    return;
};

/**
 * @type {import('commandkit').CommandOptions}
 */

const options = {
    dm_permission: false,
    userPermissions: ['Administrator']
};

module.exports = { data, run, options };