const { EmbedBuilder } = require('discord.js');
const redis = require('../../config/redis');

module.exports = async (message) => {
    // Check if there is a counting channel - if there isn't then we can stop here.
    const channel = message.client.channels.cache.find(channel => channel.name.includes('count'));
    if (!channel) {
        return;
    }

    // Check if this message was deleted in the counting channel - if it wasn't then we can stop here.
    if (message.channel.id !== channel.id) {
        return;
    }

    // Check if the message content was a number and not zero or below.
    if (isNaN(message.content) || parseInt(message.content) <= 0) {
        return;
    }

    // Check if the message was from a bot - if it was then we can stop here.
    if (message.member.user.bot) {
        return;
    }

    // Check if data exists in Redis for the counting game - if it doesn't then we can stop here.
    const query = await redis.get(`${channel.id}_countingchannel`);
    if (!query) {
        return;
    }

    // Parse the data from Redis, store it to a variable.
    const data = await JSON.parse(query);

    // Stop here if protections are disabled.
    if (!data.enableProtections) {
        return;
    }

    // Check if the message author is the last user to send a message in the counting channel - expose them if they are.
    if (data.lastUser === message.author.id) {
        // Create an embed to notify the channel of the exploiter.
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Counting Game')
            .setDescription(`${message.author} just deleted their number in an attempt to ruin the game!\nThe next correct number in the sequence is **${data.currentValue}**.`);

        // Let the channel know of the exposure.
        channel.send({ embeds: [embed] });
        return;
    }
};
