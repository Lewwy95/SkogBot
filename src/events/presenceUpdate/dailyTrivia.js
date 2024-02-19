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
                        value: 'The answer will be revealed in **1 hour**.'
                    }
                )
            ]
        });

        setTimeout(function() {
            triviaMessage.reply({ content: `The correct answer was **${data.results[0].correct_answer}**!` });
        }, 3600000);

        await query.updateOne({ timestamp: Date.now() });
    }
};