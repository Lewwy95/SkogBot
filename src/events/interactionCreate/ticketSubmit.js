const { PermissionFlagsBits, ChannelType, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');
const ticketSchema = require('../../models/ticket');

module.exports = async (interaction) => {
    if (!interaction.isModalSubmit()) {
        return;
    }

    if (interaction.customId !== 'modalTicket') {
        return;
    }

    const query = await ticketSchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    const modRole = await interaction.guild.roles.cache.find((role) => role.name === 'Moderator');

    if (!modRole) {
        interaction.followUp('There is no role with the name **"Moderator"** in this guild.');
        return;
    }

    const ticket = interaction.fields.getTextInputValue('modalInputTicket');

    const ticketChannel = await interaction.guild.channels.create({
        name: `🚨・${interaction.user.displayName ? `${interaction.user.displayName}` : `${interaction.user.username}`} Ticket`,
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

    const buttonResolve = new ButtonKit()
        .setLabel('Resolve Ticket')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('buttonResolve');

    const buttonRow = new ActionRowBuilder().addComponents(buttonResolve);

    const ticketMessage = await ticketChannel.send({
        content: '@everyone',
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('Ticket Handler')
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: 'Issue',
                    value: `${ticket}`,
                },
                {
                    name: 'Button',
                    value: 'A Moderator will resolve your ticket when necessary.',
                }
            )
        ],
        components: [buttonRow]
    });

    buttonResolve
        .onClick(
            (buttonInteraction) => {
                if (buttonInteraction.user.id === interaction.user.id) {
                    buttonInteraction.reply({
                        content: 'You can\'t resolve your own ticket.',
                        ephemeral: true 
                    });
                    return;
                }

                ticketChannel.delete();
            },
            { message: ticketMessage }
        )

    interaction.followUp(`Your ticket has been submitted and can be viewed in the <#${ticketChannel.id}> channel.`);
};