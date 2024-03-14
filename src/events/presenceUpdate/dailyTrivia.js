const { EmbedBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');
const { giveFruit } = require('../../functions/giveFruit');
const dailyTriviaSchema = require('../../models/dailyTrivia');
const fetch = require('node-fetch');

module.exports = async (oldMember, newMember) => {
    const query = await dailyTriviaSchema.findOne({ guildId: newMember.guild.id });

    if (!query) {
        return;
    }

    const channel = await newMember.guild.channels.cache.find(channel => channel.id === query.channelId);

    if (!channel) {
        return;
    }
    
    if (86400000 - (Date.now() - query.timestamp) <= 0) { // 24 hours
        const data = await fetch('https://opentdb.com/api.php?amount=1&difficulty=medium&type=boolean').then(res => res.json());
        const question = data.results[0].question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
        const correctAnswer = data.results[0].correct_answer.toString();

        const dailyTriviaTrue = new ButtonKit()
            .setLabel('True')
            .setEmoji('👍')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('buttonDailyTriviaTrue');

        const dailyTriviaFalse = new ButtonKit()
            .setLabel('False')
            .setEmoji('👎')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('buttonDailyTriviaFalse');

        const buttonRow = new ActionRowBuilder().addComponents(dailyTriviaTrue, dailyTriviaFalse);

        const triviaMessage = await channel.send({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('Daily Trivia')
                .setDescription(`Powered by Open Trivia API.`)
                .setThumbnail(newMember.client.user.displayAvatarURL({ dynamic: true }))
                .addFields({
                    name: 'Question',
                    value: `${question}`
                }),
            ],
            components: [buttonRow]
        });

        let trueMembers = [];
        let falseMembers = [];
        let correctMembers = [];
        let incorrectMembers = [];
        let correctString = '';
        let incorrectString = '';

        dailyTriviaTrue
            .onClick(
                (buttonInteraction) => {
                    if (trueMembers.includes(buttonInteraction.user.id) || falseMembers.includes(buttonInteraction.user.id)) {
                        buttonInteraction.reply({
                            content: 'You are only able to provide one answer.',
                            ephemeral: true 
                        });
                        return;
                    }

                    trueMembers.push(buttonInteraction.user.id);

                    buttonInteraction.reply({
                        content: 'You selected **True** as your answer.',
                        ephemeral: true 
                    });
                },
                { message: triviaMessage },
            )

        dailyTriviaFalse
            .onClick(
                (buttonInteraction) => {
                    if (falseMembers.includes(buttonInteraction.user.id) || trueMembers.includes(buttonInteraction.user.id)) {
                        buttonInteraction.reply({
                            content: 'You are only able to provide one answer.',
                            ephemeral: true 
                        });
                        return;
                    }

                    falseMembers.push(buttonInteraction.user.id);

                    buttonInteraction.reply({
                        content: 'You selected **False** as your answer.',
                        ephemeral: true 
                    });
                },
                { message: triviaMessage },
            )

        setTimeout(async function() {
            if (correctAnswer.toString() === 'True') {
                trueMembers.forEach(async (value) => {
                    correctMembers.push(value);
                    correctString += `\n<@${value}>`;
                    await giveFruit(newMember.guild.id, value, 20);
                });

                falseMembers.forEach(value => {
                    incorrectMembers.push(value);
                    incorrectString += `\n<@${value}>`;
                });
            }

            if (correctAnswer.toString() === 'False') {
                falseMembers.forEach(async (value) => {
                    correctMembers.push(value);
                    correctString += `\n<@${value}>`;
                    await giveFruit(newMember.guild.id, value, 20);
                });

                trueMembers.forEach(value => {
                    incorrectMembers.push(value);
                    incorrectString += `\n<@${value}>`;
                });
            }

            if (correctMembers.length === 0 || correctMembers === undefined) {
                correctString = 'No member had answered this question correctly.';
            }

            if (incorrectMembers.length === 0 || incorrectMembers === undefined) {
                incorrectString = 'No member had answered this question incorrectly.';
            }

            dailyTriviaTrue.setDisabled(true);
            dailyTriviaFalse.setDisabled(true);
            triviaMessage.edit({ components: [buttonRow] });

            triviaMessage.reply({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('Daily Trivia')
                    .setDescription(`Powered by Open Trivia API.`)
                    .setThumbnail(newMember.client.user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        {
                            name: 'Correct Answer',
                            value: `${correctAnswer}`
                        },
                        {
                            name: 'Winners',
                            value: correctString
                        },
                        {
                            name: 'Losers',
                            value: incorrectString
                        },
                        {
                            name: 'Rewards',
                            value: 'All winning members have been rewarded with **20** pieces of fruit.'
                        }
                    ),
                ],
                allowedMentions: { users: [] }
            });
        }, 900000); // 15 minutes

        await query.updateOne({ timestamp: Date.now() });
    }
};