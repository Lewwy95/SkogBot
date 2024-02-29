const { EmbedBuilder } = require('discord.js');
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
        const data = await fetch('https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple').then(res => res.json());
        const question = data.results[0].question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
        const correctAnswer = data.results[0].correct_answer.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
        const incorrectAnswers = data.results[0].incorrect_answers.toString().replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/,/g, '\n- ');

        const triviaMessage = await channel.send({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('Daily Trivia')
                .setDescription(`Powered by Open Trivia API.`)
                .setThumbnail(newMember.client.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    {
                        name: 'Question',
                        value: question
                    },
                    {
                        name: 'Possible Answers',
                        value: `- ${correctAnswer}\n- ${incorrectAnswers}`
                    }
                )
            ]
        });

        let correctMembers = [];
        let correctString = `These are the members who answered correctly:`;
        const messageAmount = await newMember.guild.members.cache.filter(member => !member.user.bot).size;

        setTimeout(async function() {
            await channel.messages.fetch({ limit: messageAmount }).then(messages => {
                messages.forEach(message => {
                    const msg = message.content.toLowerCase();

                    if (msg.includes(correctAnswer.toLowerCase()) && !correctMembers.includes(message.author.id) && !message.author.bot) {
                        correctMembers.push(message.author.id);
                        correctString += `\n<@${message.author.id}>`;
                    }
                });
            });

            if (correctMembers.length === 0 || correctMembers === undefined) {
                correctString = 'No member had managed to answer this question correctly.';
            }

            triviaMessage.reply({
                content: `The correct answer is **${correctAnswer}**!\n\n${correctString}`,
                allowedMentions: { users: [] }
            });
        }, 1800000);

        await query.updateOne({ timestamp: Date.now() });
    }
};