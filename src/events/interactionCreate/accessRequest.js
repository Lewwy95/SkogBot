const { PermissionFlagsBits, ChannelType, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');
const accessRequestsSchema = require('../../models/accessRequests');

module.exports = async (interaction) => {
    try {
        if (!interaction.isButton()) {
            return;
        }
        
        if (interaction.customId === 'buttonAccessRequest') {
            await interaction.deferReply({ ephemeral: true });

            const query = { guildId: interaction.guild.id };

            const accessRequestExists = await accessRequestsSchema.exists(query);

            if (!accessRequestExists) {
                interaction.followUp('The access request system is currently offline. Please try again later.');
                return;
            }

            const data = await accessRequestsSchema.findOne({ ...query });

            const hasVerifiedRole = await interaction.member.roles.cache.some(role => role.id === data.verifiedRoleId);

            if (hasVerifiedRole) {
                interaction.followUp(`You already have the <@&${data.verifiedRoleId}> role.`);
                return;
            }

            const requestingMemberId = interaction.user.id;

            const channel = await interaction.guild.channels.create({
                name: `🚨・${interaction.member.displayName ? `${interaction.member.displayName}` : `${interaction.member.user.username}`} Request`,
                type: ChannelType.GuildText,
                parent: interaction.channel.parentId,
                permissionOverwrites: [{
                        id: interaction.member.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages]
                    },
                    {
                        id: data.modRoleId,
                        allow: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    }
                ]
            });

            const buttonGrantRequest = new ButtonKit()
                .setLabel('Grant Request')
                .setEmoji('👍')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('buttonGrantRequest');

            const buttonDenyRequest = new ButtonKit()
                .setLabel('Deny Request')
                .setEmoji('👎')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('buttonDenyRequest');
 
            const buttonRow = new ActionRowBuilder().addComponents(buttonGrantRequest, buttonDenyRequest);

            const reviewMessage = await channel.send({
                content: `Please be available while a member of the <@&${data.modRoleId}> role reviews your request.\n\nIn the meantime, please make sure your nickname is recognisable to others.`,
                components: [buttonRow]
            });

            buttonGrantRequest
                    .onClick(
                        async (buttonInteraction) => {
                            const hasVerifiedRole = await buttonInteraction.member.roles.cache.some(role => role.id === data.verifiedRoleId);
                            const hasModRole = await buttonInteraction.member.roles.cache.some(role => role.id === data.modRoleId);

                            if (hasVerifiedRole && !hasModRole) {
                                buttonInteraction.reply({
                                    content: `You already have the <@&${data.verifiedRoleId}> role.`,
                                    ephemeral: true
                                });
                                return;
                            }

                            if (buttonInteraction.user.id === requestingMemberId || !hasModRole) {
                                buttonInteraction.reply({
                                    content: `Only a member of the <@&${data.modRoleId}> role can use this.`,
                                    ephemeral: true
                                });
                                return;
                            }

                            buttonGrantRequest.setDisabled(true);

                            const target = await buttonInteraction.guild.members.fetch(requestingMemberId);

                            await target.roles.add(data.verifiedRoleId);

                            await buttonInteraction.channel.delete();
                        },
                        { message: reviewMessage, time: 10000 } // Expires after 24 hours
                    )
                    .onEnd(async () => {
                        buttonGrantRequest.setDisabled(true);
                    });
            
            buttonDenyRequest
                    .onClick(
                        async (buttonInteraction) => {
                            const hasModRole = await buttonInteraction.member.roles.cache.some(role => role.id === data.modRoleId);

                            if (buttonInteraction.user.id === requestingMemberId || !hasModRole) {
                                buttonInteraction.reply({
                                    content: `Only a member of the <@&${data.modRoleId}> role can use this.`,
                                    ephemeral: true
                                });
                                return;
                            }

                            const target = await buttonInteraction.guild.members.fetch(requestingMemberId);

                            if (!target.kickable) {
                                buttonInteraction.reply({
                                    content: 'I am unable to deny this member access as I can\'t kick them.',
                                    ephemeral: true
                                });
                                return;
                            }

                            buttonDenyRequest.setDisabled(true);

                            await target.kick('Denied Access');

                            await buttonInteraction.channel.delete();
                        },
                        { message: reviewMessage, time: 10000 } // Expires after 24 hours
                    )
                    .onEnd(async () => {
                        buttonGrantRequest.setDisabled(true);
                    });

            interaction.followUp(`You have requested access. Please head to the <#${channel.id}> channel for review.`);
        }
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};