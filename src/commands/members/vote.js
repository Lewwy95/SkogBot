const { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');

const data = new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Create a vote that members can participate in.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addStringOption((option) =>
        option
            .setName('question')
            .setDescription('The question that members will vote on.')
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(128)
    )
    .addNumberOption((option) =>
        option
            .setName('time')
            .setDescription('The time it takes for the vote to expire.')
            .addChoices({
                name: '3 Minutes',
                value: 180000
            }, {
                name: '5 Minutes',
                value: 300000
            }, {
                name: '10 Minutes',
                value: 600000
            }, {
                name: '30 Minutes',
                value: 1800000
            })
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    await interaction.deferReply();

    const question = interaction.options.getString('question');
    const time = interaction.options.getNumber('time');

    const buttonYes = new ButtonKit()
        .setLabel('Yes')
        .setEmoji('👍')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('buttonYes');

    const buttonNo = new ButtonKit()
        .setLabel('No')
        .setEmoji('👎')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('buttonNo');
 
    const buttonRow = new ActionRowBuilder().addComponents(buttonYes, buttonNo);

    const voteMessage = await interaction.channel.send({
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setAuthor({
                name: `${interaction.user.displayName ? interaction.user.displayName : interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTitle('Vote')
            .setDescription(`"${question}"`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        ],
        components: [buttonRow],
        allowedMentions: { users: [] }
    });

    interaction.deleteReply();

    const creatorId = interaction.user.id;
    let buttonYesVoters = [];
    let buttonNoVoters = [];
    let buttonYesVotes = 0;
    let buttonNoVotes = 0;

    buttonYes
        .onClick(
            (buttonInteraction) => {
                if (buttonInteraction.user.id === creatorId) {
                    buttonInteraction.reply({
                        content: 'You can\'t participate in your own vote.',
                        ephemeral: true 
                    });
                    return;
                }

                if (buttonYesVoters.includes(buttonInteraction.user.id) || buttonNoVoters.includes(buttonInteraction.user.id)) {
                    buttonInteraction.reply({
                        content: 'You are only able to vote once.',
                        ephemeral: true 
                    });
                    return;
                }

                buttonYesVoters.push(buttonInteraction.user.id);
                buttonYesVotes ++;

                buttonInteraction.reply({
                    content: 'Thank you for your vote.',
                    ephemeral: true 
                });
            },
            { message: voteMessage, time: `${time ? time : 300000}`, autoReset: false },
        )
        .onEnd(() => {
            buttonYes.setDisabled(true);
            voteMessage.edit({ components: [buttonRow] });
        });

    buttonNo
        .onClick(
            (buttonInteraction) => {
                if (buttonInteraction.user.id === creatorId) {
                    buttonInteraction.reply({
                        content: 'You can\'t participate in your own vote.',
                        ephemeral: true 
                    });
                    return;
                }

                if (buttonNoVoters.includes(buttonInteraction.user.id) || buttonYesVoters.includes(buttonInteraction.user.id)) {
                    buttonInteraction.reply({
                        content: 'You are only able to vote once.',
                        ephemeral: true 
                    });
                    return;
                }

                buttonNoVoters.push(buttonInteraction.user.id);
                buttonNoVotes ++;

                buttonInteraction.reply({
                    content: 'Thank you for your vote.',
                    ephemeral: true 
                });
            },
            { message: voteMessage, time: `${time ? time : 300000}`, autoReset: false },
        )
        .onEnd(() => {
            buttonNo.setDisabled(true);

            if (buttonYesVotes > buttonNoVotes) {
                buttonYes.setStyle(ButtonStyle.Success);
                buttonNo.setStyle(ButtonStyle.Danger);

                buttonYes.setLabel('Yes Wins')
                buttonNo.setLabel('No Loses')

                buttonYes.setEmoji('🥳');
                buttonNo.setEmoji('😭');
            }

            if (buttonNoVotes > buttonYesVotes) {
                buttonNo.setStyle(ButtonStyle.Success);
                buttonYes.setStyle(ButtonStyle.Danger);

                buttonNo.setLabel('No Wins')
                buttonYes.setLabel('Yes Loses')

                buttonNo.setEmoji('🥳');
                buttonYes.setEmoji('😭');
            }

            if (buttonYesVotes === buttonNoVotes) {
                buttonYes.setStyle(ButtonStyle.Success);
                buttonNo.setStyle(ButtonStyle.Success);

                buttonYes.setLabel('Tie')
                buttonNo.setLabel('Tie')

                buttonYes.setEmoji('🥲');
                buttonNo.setEmoji('🥲');
            }

            voteMessage.edit({
                content: `This vote has ended.`,
                components: [buttonRow]
            });
        });
};

module.exports = { data, run };