const { PermissionFlagsBits, ChannelType, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');
const eventSchema = require('../../models/event');

module.exports = async (interaction) => {
    if (!interaction.isModalSubmit()) {
        return;
    }

    if (interaction.customId !== 'modalEvent') {
        return;
    }

    const query = await eventSchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    const modRole = await interaction.guild.roles.cache.find((role) => role.name === 'Moderator');

    if (!modRole) {
        interaction.followUp('There is no role with the name **"Moderator"** in this guild.');
        return;
    }

    const event = interaction.fields.getTextInputValue('modalInputEvent');

    const eventChannel = await interaction.guild.channels.create({
        name: `🚨・${interaction.user.displayName ? `${interaction.user.displayName}` : `${interaction.user.username}`} Event`,
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

    const buttonEventResolve = new ButtonKit()
        .setLabel('Resolve')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('buttonEventResolve');

    const buttonRow = new ActionRowBuilder().addComponents(buttonEventResolve);

    const eventMessage = await eventChannel.send({
        content: '@everyone',
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('Event Handler')
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: 'Request',
                    value: `${event}`,
                },
                {
                    name: 'Button',
                    value: 'A Moderator will resolve your request when necessary.',
                }
            )
        ],
        components: [buttonRow]
    });

    buttonEventResolve
        .onClick(
            (buttonInteraction) => {
                if (buttonInteraction.user.id === interaction.user.id) {
                    buttonInteraction.reply({
                        content: 'You can\'t resolve your own request.',
                        ephemeral: true 
                    });
                    return;
                }

                eventChannel.delete();
            },
            { message: eventMessage }
        )

    interaction.followUp(`Your event request has been submitted and can be viewed in the <#${eventChannel.id}> channel.`);
};