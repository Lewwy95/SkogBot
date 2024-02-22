const { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');
const suggestionSchema = require('../../models/suggestion');

const data = new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Create a suggestion that members can vote for.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addStringOption((option) =>
        option
            .setName('suggestion')
            .setDescription('The suggestion that members will vote on.')
            .setRequired(true)
            .setMinLength(12)
            .setMaxLength(240)
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    await interaction.deferReply({ ephemeral: true });

    const query = await suggestionSchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        interaction.followUp('The suggestion system is currently offline. Please try again later.');
        return;
    }

    const channel = interaction.guild.channels.cache.find(channel => channel.id === query.channelId);

    if (!channel) {
        interaction.followUp('The suggestion system is currently offline. Please try again later.');
        return;
    }

    const suggestion = interaction.options.getString('suggestion');

    const buttonAgree = new ButtonKit()
        .setLabel('0')
        .setEmoji('👍')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('buttonAgree');

    const buttonDisagree = new ButtonKit()
        .setLabel('0')
        .setEmoji('👎')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('buttonDisagree');
 
    const buttonRow = new ActionRowBuilder().addComponents(buttonAgree, buttonDisagree);

    const suggestMessage = await channel.send({
        content: 'The vote for this suggestion is currently active.',
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setAuthor({
                name: `${interaction.user.displayName ? interaction.user.displayName : interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTitle('Suggestion')
            .setDescription(`${suggestion}`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        ],
        components: [buttonRow],
        allowedMentions: { users: [] }
    });

    interaction.followUp(`Thank you for submitting this suggestion. You can view it in the <#${channel.id}> channel.`);

    const creatorId = interaction.user.id;
    let buttonAgreeVoters = [];
    let buttonDisagreeVoters = [];
    let buttonAgreeVotes = 0;
    let buttonDisagreeVotes = 0;

    buttonAgree
        .onClick(
            (buttonInteraction) => {
                if (buttonInteraction.user.id === creatorId) {
                    buttonInteraction.reply({
                        content: 'You can\'t vote on your own suggestion.',
                        ephemeral: true 
                    });
                    return;
                }

                if (buttonAgreeVoters.includes(buttonInteraction.user.id) || buttonDisagreeVoters.includes(buttonInteraction.user.id)) {
                    buttonInteraction.reply({
                        content: 'You are only able to vote on this suggestion once.',
                        ephemeral: true 
                    });
                    return;
                }

                buttonAgreeVoters.push(buttonInteraction.user.id);
                buttonAgreeVotes ++;

                buttonAgree.setLabel(`${buttonAgreeVotes}`);
                suggestMessage.edit({ components: [buttonRow] });

                buttonInteraction.reply({
                    content: 'Thank you for your vote.',
                    ephemeral: true 
                });
            },
            { message: suggestMessage, time: 86400000, autoReset: true }, // 24 hours but resets on click
        )
        .onEnd(() => {
            buttonAgree.setDisabled(true);
            buttonDisagree.setDisabled(true);

            buttonAgree.setLabel(`${buttonAgreeVotes}`);
            buttonDisagree.setLabel(`${buttonDisagreeVotes}`);

            suggestMessage.edit({
                content: `The vote for this suggestion has expired.`,
                components: [buttonRow]
            });
        });

    buttonDisagree
        .onClick(
            (buttonInteraction) => {
                if (buttonInteraction.user.id === creatorId) {
                    buttonInteraction.reply({
                        content: 'You can\'t vote on your own suggestion.',
                        ephemeral: true 
                    });
                    return;
                }

                if (buttonDisagreeVoters.includes(buttonInteraction.user.id) || buttonAgreeVoters.includes(buttonInteraction.user.id)) {
                    buttonInteraction.reply({
                        content: 'You are only able to vote on this suggestion once.',
                        ephemeral: true 
                    });
                    return;
                }

                buttonDisagreeVoters.push(buttonInteraction.user.id);
                buttonDisagreeVotes ++;

                buttonDisagree.setLabel(`${buttonDisagreeVotes}`);
                suggestMessage.edit({ components: [buttonRow] });

                buttonInteraction.reply({
                    content: 'Thank you for your vote.',
                    ephemeral: true 
                });
            },
            { message: suggestMessage, time: 86400000, autoReset: true }, // 24 hours but resets on click
        )
        .onEnd(() => {
            buttonAgree.setDisabled(true);
            buttonDisagree.setDisabled(true);

            buttonAgree.setLabel(`${buttonAgreeVotes}`)
            buttonDisagree.setLabel(`${buttonDisagreeVotes}`)

            suggestMessage.edit({
                content: `The vote for this suggestion has expired.`,
                components: [buttonRow]
            });
        });
};

module.exports = { data, run };