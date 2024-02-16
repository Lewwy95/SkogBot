const { EmbedBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { ButtonKit } = require('commandkit');
const verifySchema = require('../../models/verify');

module.exports = async (member) => {
    const query = await verifySchema.findOne({ guildId: member.guild.id });

    if (!query) {
        return;
    }

    const channel = member.guild.channels.cache.find(channel => channel.id === query.channelId);

    if (!channel) {
        return;
    }

    const buttonVerify = new ButtonKit()
        .setLabel('Verify')
        .setEmoji('👍')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('buttonVerify');

    const buttonDeny = new ButtonKit()
        .setLabel('Deny')
        .setEmoji('👎')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('buttonDeny');

    const buttonRow = new ActionRowBuilder().addComponents(buttonVerify, buttonDeny);

    const verifyMessage = await channel.send({
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setAuthor({
                name: `${member.user.displayName ? member.user.displayName : member.user.username}`,
                iconURL: member.user.displayAvatarURL({ dynamic: true })
            })
            .setTitle('A new member is awaiting verification!')
            .setDescription('Click a button below to decide their fate.')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        ],
        components: [buttonRow]
    });

    buttonVerify
        .onClick(
            async (buttonInteraction) => {
                const verifiedRole = member.guild.roles.cache.find((role) => role.name === 'Verified');

                if (!verifiedRole) {
                    buttonInteraction.reply({
                        content: `There is no role with the name **"Verified"** in this guild.`,
                        ephemeral: true
                    });
                    return;
                }

                verifyMessage.edit({ 
                    embeds: [new EmbedBuilder()
                        .setColor('Purple')
                        .setAuthor({
                            name: `${member.user.displayName ? member.user.displayName : member.user.username}`,
                            iconURL: member.user.displayAvatarURL({ dynamic: true })
                        })
                        .setTitle('Access Granted')
                        .setDescription(`This verification was granted by <@${buttonInteraction.user.id}>.`)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true })),
                    ],
                    allowedMentions: { users: [] },
                    components: [],
                });

                await member.roles.add(verifiedRole.id);

                buttonInteraction.reply({
                    content: `You have granted <@${member.id}> access to the server.`,
                    ephemeral: true
                });
            }, {
                message: verifyMessage,
                time: 86400000  // Expires after 24 hours
            }
        )
        .onEnd(async () => {
            verifyMessage.edit({ 
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setAuthor({
                        name: `${member.user.displayName ? member.user.displayName : member.user.username}`,
                        iconURL: member.user.displayAvatarURL({ dynamic: true })
                    })
                    .setTitle('Verification Expired')
                    .setDescription('This verification was not actioned in time.')
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true })),
                ],
                components: []
            });
        });

    buttonDeny
        .onClick(
            async (buttonInteraction) => {
                if (!member.kickable) {
                    buttonInteraction.reply({
                        content: 'I am unable to deny this member as I can\'t kick them.',
                        ephemeral: true
                    });
                    return;
                }
                
                verifyMessage.edit({ 
                    embeds: [new EmbedBuilder()
                        .setColor('Purple')
                        .setAuthor({
                            name: `${member.user.displayName ? member.user.displayName : member.user.username}`,
                            iconURL: member.user.displayAvatarURL({ dynamic: true })
                        })
                        .setTitle('Access Denied')
                        .setDescription(`This verification was denied by <@${buttonInteraction.user.id}>.`)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true })),
                    ],
                    allowedMentions: { users: [] },
                    components: []
                });;

                await member.kick('Denied Access');

                buttonInteraction.reply({
                    content: `You have refused <@${member.id}> access to the server.`,
                    ephemeral: true
                });
            }, {
                message: verifyMessage,
                time: 86400000 // Expires after 24 hours
            }
        )
        .onEnd(async () => {
            verifyMessage.edit({ 
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setAuthor({
                        name: `${member.user.displayName ? member.user.displayName : member.user.username}`,
                        iconURL: member.user.displayAvatarURL({ dynamic: true })
                    })
                    .setTitle('Verification Expired')
                    .setDescription('This verification was not actioned in time.')
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true })),
                ],
                components: []
            });
        });
};