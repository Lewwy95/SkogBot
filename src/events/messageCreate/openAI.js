const { OpenAI } = require('openai');
const { openAIKey } = require('../../config');
const db = require('../../index');

module.exports = async (message) => {
    // Get the OpenAI configuration from the database
    const result = await db.get(`${message.guild.id}_configs.openAI`);

    // If valid OpenAI configuration was found and the message was sent by a member
    if (result && !message.author.bot) {
        // If the message was sent in the OpenAI channel
        if (message.channel.id === result.channelId) {
            // Create a new instance of OpenAI
            const openAI = new OpenAI({ apiKey: `${openAIKey}` });

            // Set the bot to start typing in the Open AI channel
            await message.channel.sendTyping();

            // Set how long the bot should be typing for
            const sendTypingInterval = setInterval(() => {
                message.channel.sendTyping();
            }, 5000);

            // Create an empty conversation array
            let conversation = [];

            // Store the system role in the conversation array
            conversation.push({
                role: 'system',
                content: 'Chat-GPT is a friendly chatbot.'
            });

            // Fetch previous messages and store them so OpenAI can keep track
            let prevMessages = await message.channel.messages.fetch({ limit: 10 });
            prevMessages.reverse();

            // Loop through each previous message
            prevMessages.forEach((msg) => {
                // Do nothing if the author of the previous message was the bot
                if (msg.author.bot && msg.author.id !== message.client.user.id) return;

                // Format the username of the previous message
                const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

                // Push the previous message content to the conversation array if it was from the bot
                if (msg.author.id === message.client.user.id) {
                    conversation.push({
                        role: 'assistant',
                        name: username,
                        content: msg.content
                    });

                    return;
                }

                // Push the previous message content to the conversation array if it was from a member
                conversation.push({
                    role: 'user',
                    name: username,
                    content: msg.content
                });
            });

            // Create an OpenAI response
            const response = await openAI.chat.completions.create({
                model: 'gpt-4',
                messages: conversation
            }).catch(console.error);

            // Clear the typing status of the bot
            clearInterval(sendTypingInterval);

            // Send an error message to the channel if the API returned an error
            if (!response) {
                message.reply('I\'m having some trouble with the OpenAI API. Please try again later.');
                return;
            }

            // Create a response message
            const responseMessage = response.choices[0].message.content;

            // Create a chunk size limit
            const chunkSizeLimit = 2000;

            // Reply to the member with an OpenAI generated message
            for (let i = 0; i < responseMessage.length; i+= chunkSizeLimit) {
                const chunk = responseMessage.substring(i, i + chunkSizeLimit);
                await message.reply(chunk);
            }
        }
    }
};