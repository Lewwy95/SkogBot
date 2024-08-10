const { OpenAI } = require('openai');
const { openAIKey } = require('../../config/cross-env');
const openAI = new OpenAI({ apiKey: openAIKey });

module.exports = async (message) => {
    // Get any possible users that were mentioned in the message.
    // If no user or the client was mentioned then we can stop here!
    const mentionedUser = message.mentions.users.first();
    if (!mentionedUser || mentionedUser.id !== message.client.user.id) {
        return;
    }

    // Check if there is an OpenAI channel - if there isn't then we can stop here.
    const channel = message.client.channels.cache.find(channel => channel.name.includes('open') && channel.name.includes('ai'));
    if (!channel) {
        return;
    }

    // Check if the message was sent in the OpenAI channel - if it wasn't then we can stop here.
    if (message.channel.id !== channel.id) {
        return;
    }

    // Show the "user is typing..." message in the channel for a few seconds while we generate a response.
    message.channel.sendTyping();
    const sendTypingInterval = setInterval(() => {
        message.channel.sendTyping();
    }, 3500);

    // Initialise this instance of OpenAI.
    // Give it clear purpose and instructions.
    let conversation = [];
    conversation.push({
        role: 'system',
        content: 'You are a friendly chat bot. Respond with short messages only.'
    });

    // Fetch the last 10 messages in the channel and reverse them - this will allow us to loop through them in the correct order!
    // It will help us to build a conversation array to send to OpenAI.
    let oldMessages = await message.channel.messages.fetch({ limit: 10 });
    oldMessages.reverse();

    // Loop through the fetched messages and build the conversation array.
    oldMessages.forEach((msg) => {
        // Skip any messages that are from bots (including the assistant bot) and the client itself.
        if (msg.author.bot && msg.author.id !== message.client.user.id) {
            return;
        }

        // Replace any spaces and special characters in the username to prevent issues with the OpenAI API.
        const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');
        if (msg.author.id === message.client.user.id) {
            conversation.push({
                role: 'assistant',
                name: username,
                content: msg.content
            });
        } else {
            conversation.push({
                role: 'user',
                name: username,
                content: msg.content
            });
        }
    });

    // Send the conversation array to OpenAI to prompt a response.
    // We'll use the GPT-4 model for this as it's the most advanced model available.
    const response = await openAI.chat.completions.create({
        model: 'gpt-4',
        messages: conversation
    });

    // Clear the "user is typing..." message and stop the interval.
    clearInterval(sendTypingInterval);

    // Check if the response from OpenAI is valid - if it's not then we can stop here!
    if (!response) {
        message.channel.send('I\'m having some trouble with the OpenAI API. Please try again.');
        return;
    }

    // Loop through the response message and send it in chunks to the channel.
    // This will prevent the message from being too long and getting cut off.
    const responseMessage = response.choices[0].message.content;
    const chunkSizeLimit = 2000;
    for (let i = 0; i < responseMessage.length; i+= chunkSizeLimit) {
        const chunk = responseMessage.substring(i, i + chunkSizeLimit);
        await message.channel.send(chunk); 
    }
};