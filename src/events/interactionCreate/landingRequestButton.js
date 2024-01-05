const { PermissionFlagsBits, EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const db = require('../../index');

module.exports = async (interaction) => {
    // Do nothing if the interaction is not a button
    if (!interaction.isButton()) return;

    // Handle if the instigator clicked the landing channel access button
    if (interaction.customId === 'landingAccess') {
        // Keep the member waiting while the interaction is processing
        await interaction.deferReply({ ephemeral: true });

        // Get the landing channel from the database
        const result = await db.get(`${interaction.guild.id}_configs.landing`);

        // Return an error to the instigator if no entry was found
        if (!result) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ You can\'t request access until the landing channel has been set up.')
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Return an error to the instigator if no entry was found
        if (!result.verifiedRoleId) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ You can\'t request access until the Verified role has been set up.')
                ],
                ephemeral: true
            }).catch(console.error);
         }

        // Return an error to the instigator if no entry was found
        if (!result.modRoleId) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ You can\'t request access until the Moderator role has been set up.')
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Get the user data from the database
        const data = await db.get(`${interaction.guild.id}_members.${interaction.member.user.username}`);

        // Create a variable to check whether or not the requesting member has the Verified role
        const hasVerifiedRole = await interaction.member.roles.cache.some(role => role.id === result.verifiedRoleId);

        // Return an error to the instigator if they are already verified
        if (hasVerifiedRole) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription(`❌ You already have the <@&${result.verifiedRoleId}> role.`)
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Return an error to the instigator if they have already requested access
        if (data && data.accessClicked) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ You have already requested access.')
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Create a new review channel for the member and Moderators
        const channel = await interaction.guild.channels.create({
            name: `🚨・${interaction.member.nickname ? `${interaction.member.nickname}` : `${interaction.member.user.username}`} Review`,
            type: ChannelType.GuildText,
            parent: interaction.channel.parentId,
            permissionOverwrites: [{
                    id: interaction.member.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages]
                },
                {
                    id: result.modRoleId,
                    allow: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                }
            ]
        }).catch(console.error);

        // Create a grant access button
        const grantButton = new ButtonBuilder()
            .setLabel('Grant Access')
            .setStyle(ButtonStyle.Success)
            .setCustomId('landingGrantAccess')

        // Create a refuse access button
        const refuseButton = new ButtonBuilder()
            .setLabel('Refuse Access')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('landingRefuseAccess')

        // Bundle the button into a row
        const buttonRow = new ActionRowBuilder().addComponents(grantButton, refuseButton);

        /*
        // THE BUTTONS ARE HANDLED IN:
        // "./src/events/interactionCreate/"
        */

        // Send a message to the member's new channel explaining what's going on
        await channel.send({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('👍 Access Requested')
                .setDescription(`Please be available while a <@&${result.modRoleId}> reviews your request.`)
                .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                .addFields({
                    name: 'Policy',
                    value: 'Only Rockstar Games employees can gain access.'
                }, {
                    name: 'Nickname',
                    value: 'Your nickname must be recognisable.'
                })
            ],
            components: [buttonRow],
            allowedMentions: false
        }).catch(console.error);

        // Store the requesting member in the database
        await db.set(`${interaction.guild.id}_data.accessReq_${channel.id}.accessReqUserId`, interaction.member.id);
        await db.set(`${interaction.guild.id}_data.accessReq_${channel.id}.accessReqUsername`, interaction.member.user.username);

        // Store the button click in the database
        await db.set(`${interaction.guild.id}_members.${interaction.member.user.username}.accessClicked`, true);

        // Delete the original interaction as the channel won't be visible anymore
        return await interaction.followUp({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('👍 Access Requested')
                .setDescription(`Please head to your <#${channel.id}> channel for review.`)
            ],
            ephemeral: true
        });
    }
};