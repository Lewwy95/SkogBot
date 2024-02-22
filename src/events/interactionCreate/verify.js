const { PermissionFlagsBits, EmbedBuilder, ChannelType, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');
const verifySchema = require('../../models/verify');

module.exports = async (interaction) => {
    if (!interaction.isButton()) {
        return;
    }

    if (interaction.customId !== 'buttonVerifyRequest') {
        return;
    }

    const query = await verifySchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    const modRole = await interaction.guild.roles.cache.find((role) => role.name === 'Moderator');

    if (!modRole) {
        interaction.followUp('There is no role with the name **"Moderator"** in this guild.');
        return;
    }

    const verifiedRole = await interaction.guild.roles.cache.find((role) => role.name === 'Verified');

    if (!verifiedRole) {
        interaction.followUp('There is no role with the name **"Verified"** in this guild.');
        return;
    }

    const verifyChannel = await interaction.guild.channels.create({
        name: `🚨・${interaction.user.displayName ? `${interaction.user.displayName}` : `${interaction.user.username}`} Verify`,
        type: ChannelType.GuildText,
        parent: query.parentId,
        permissionOverwrites: [
            {
                id: interaction.user.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages]
            },
            {
                id: modRole.id,
                allow: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
            }
        ]
    });

    interaction.followUp(`Your request has been submitted and can be viewed in the <#${verifyChannel.id}> channel.`);

    const buttonVerifyAccept = new ButtonKit()
        .setLabel('Accept')
        .setEmoji('👍')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('buttonVerifyAccept');

    const buttonVerifyDeny = new ButtonKit()
        .setLabel('Deny')
        .setEmoji('👎')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('buttonVerifyGrant');

    const buttonRow = new ActionRowBuilder().addComponents(buttonVerifyAccept, buttonVerifyDeny);

    const verifyMessage = await verifyChannel.send({
        content: '@everyone',
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('Verification Handler')
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: 'Info',
                    value: 'Please make sure your nickname makes you recognisable to others.',
                    inline: true
                },
                {
                    name: 'Buttons',
                    value: 'A Moderator will resolve your request when applicable.',
                    inline: true
                }
            )
        ],
        components: [buttonRow]
    });

    buttonVerifyAccept
        .onClick(
            async (buttonInteraction) => {
                if (buttonInteraction.user.id === interaction.user.id) {
                    buttonInteraction.reply({
                        content: 'You can\'t accept your own request.',
                        ephemeral: true 
                    });
                    return;
                }

                await interaction.member.roles.add(verifiedRole.id);

                verifyChannel.delete();
            },
            { message: verifyMessage }
        )

    buttonVerifyDeny
        .onClick(
            async (buttonInteraction) => {
                if (buttonInteraction.user.id === interaction.user.id) {
                    buttonInteraction.reply({
                        content: 'You can\'t deny your own request.',
                        ephemeral: true 
                    });
                    return;
                }

                if (!interaction.member.kickable) {
                    buttonInteraction.reply({
                        content: 'I can\'t deny this request as the member is not kickable.',
                        ephemeral: true 
                    });
                    return;
                }

                await interaction.member.kick('Verify Denied');
                
                verifyChannel.delete();
            },
            { message: verifyMessage }
        )
};