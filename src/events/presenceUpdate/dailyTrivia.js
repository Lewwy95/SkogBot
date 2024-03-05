const { EmbedBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');
const fetch = require('node-fetch');
const dailyTriviaSchema = require('../../models/dailyTrivia');

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
        const data = await fetch('https://opentdb.com/api.php?amount=1&category=15&difficulty=medium&type=multiple').then(res => res.json());
        const question = data.results[0].question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
        const correctAnswer = data.results[0].correct_answer.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
        const incorrectAnswers = data.results[0].incorrect_answers.toString().replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
        const possibleAnswers = [correctAnswer, incorrectAnswers];

        for (let i = possibleAnswers.length - 1; i > 0; i--) {
            let idx = Math.floor(Math.random() * (i + 1));
            let temp = possibleAnswers[idx];
            possibleAnswers[idx] = possibleAnswers[i];
            possibleAnswers[i] = temp;
        }

        const dailyTriviaSet = new ButtonKit()
            .setLabel('Submit Answer')
            .setEmoji('🤫')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('buttonDailyTriviaSet');

        const buttonRow = new ActionRowBuilder().addComponents(dailyTriviaSet);

        const triviaMessage = await channel.send({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('Daily Trivia')
                .setDescription(`Powered by Open Trivia API.`)
                .setThumbnail(newMember.client.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    {
                        name: 'Question',
                        value: `${question}`
                    },
                    {
                        name: 'Possible Answers',
                        value: `${possibleAnswers.toString().replace(/,/g, ', ')}`
                    }
                ),
            ],
            components: [buttonRow]
        });

        let correctMembers = [];
        let incorrectMembers = [];
        let correctString = '';
        let incorrectString = '';

        setTimeout(async function() {
            const query = await dailyTriviaSchema.findOne({ guildId: newMember.guild.id });

            if (!query) {
                return;
            }

            query.answers.forEach(value => {
                if (value.answer.toLowerCase().includes(correctAnswer.toLowerCase()) && !correctMembers.includes(value.memberId)) {
                    correctMembers.push(value.memberId);
                    correctString += `\n<@${value.memberId}>`;
                }

                if (!value.answer.toLowerCase().includes(correctAnswer.toLowerCase()) && !incorrectMembers.includes(value.memberId))
                {
                    incorrectMembers.push(value.memberId);
                    incorrectString += `\n<@${value.memberId}> - "${value.answer}"`;
                }
            });

            if (correctMembers.length === 0 || correctMembers === undefined) {
                correctString = 'No member had answered this question correctly.';
            }

            if (incorrectMembers.length === 0 || incorrectMembers === undefined) {
                incorrectString = 'No member had answered this question incorrectly.';
            }

            dailyTriviaSet.setDisabled(true);
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
                        }
                    ),
                ]
            });

            await query.updateOne({ answers: [] });
        }, 900000); // 15 minutes

        await query.updateOne({ timestamp: Date.now() });
    }
};