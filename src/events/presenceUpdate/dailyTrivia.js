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

        const triviaMessage = await channel.send({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('Daily Trivia')
                .setDescription(`Powered by Open Trivia API.`)
                .setThumbnail(newMember.client.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    {
                        name: 'Question',
                        value: `${data.results[0].question}`
                    },
                    {
                        name: 'Answer',
                        value: 'The answer will be revealed in **30 minutes** and must be an exact match.'
                    }
                )
            ]
        });

        let correctMembers = [];
        let correctString = `These are the members that got it right:`;

        setTimeout(async function() {
            await channel.messages.fetch({ limit: 100 }).then(messages => {
                messages.forEach(message => {
                    const msg = message.content.toLowerCase();

                    if (msg.includes(data.results[0].correct_answer.toLowerCase()) && !correctMembers.includes(message.author.id)) {
                        correctMembers.push(message.author.id);
                        correctString += `\n<@${message.author.id}>`;
                    }
                });
            });

            if (correctMembers.length === 0 || correctMembers === undefined) {
                correctString = 'No member had managed to this question correctly.';
            }

            triviaMessage.reply({
                content: `The correct answer is **${data.results[0].correct_answer}**!\n\n${correctString}`,
                allowedMentions: { users: [] }
            });
        }, 1800000);

        await query.updateOne({ timestamp: Date.now() });
    }
};