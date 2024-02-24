const { EmbedBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');
const suggestionSchema = require('../../models/suggestion');

module.exports = async (interaction) => {
    if (!interaction.isModalSubmit()) {
        return;
    }

    if (interaction.customId !== 'modalSuggestion') {
        return;
    }

    const query = await suggestionSchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    const suggestion = interaction.fields.getTextInputValue('modalInputSuggestion');

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

    const suggestMessage = await interaction.channel.send({
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

    interaction.followUp(`Your suggestion has been submitted.`);
};