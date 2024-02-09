const { OpenAI } = require('openai');
const { openAIKey } = require('../../config');
const openAIsSchema = require('../../models/openAIs');

module.exports = async (message) => {
    try {
        const query = await openAIsSchema.findOne({ guildId: message.guild.id });

        if (!query) {
            return;
        }

        const mentionedUser = message.mentions.users.first();

        if (!mentionedUser || mentionedUser.id !== message.client.user.id) {
            return;
        }

        const openAI = new OpenAI({ apiKey: `${openAIKey}` });

        await message.channel.sendTyping();

        const sendTypingInterval = setInterval(() => {
            message.channel.sendTyping();
        }, 3500);

        let conversation = [];

        conversation.push({
            role: 'system',
            content: query.behaviour
        });

        let prevMessages = await message.channel.messages.fetch({ limit: 10 });
        prevMessages.reverse();

        prevMessages.forEach((msg) => {
            if (msg.author.bot && msg.author.id !== message.client.user.id) {
                return;
            }

            const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

            if (msg.author.id === message.client.user.id) {
                conversation.push({
                    role: 'assistant',
                    name: username,
                    content: msg.content
                });

                return;
            }

            conversation.push({
                role: 'user',
                name: username,
                content: msg.content
            });
        });

        const response = await openAI.chat.completions.create({
            model: 'gpt-4',
            messages: conversation
        }).catch(console.error);

        clearInterval(sendTypingInterval);

        if (!response) {
            message.reply('I\'m having some trouble with the OpenAI API. Please try again later.');
            return;
        }

        const responseMessage = response.choices[0].message.content;

        const chunkSizeLimit = 2000;

        for (let i = 0; i < responseMessage.length; i+= chunkSizeLimit) {
            const chunk = responseMessage.substring(i, i + chunkSizeLimit);
            await message.reply(chunk);
        }
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};