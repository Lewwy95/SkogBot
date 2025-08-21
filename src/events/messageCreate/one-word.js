const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const redis = require('../../config/redis');

module.exports = async (message) => {
    // Check if there is a one word channel - if there isn't then we can stop here.
    const channel = message.client.channels.cache.find(channel => channel.name.includes('one-word'));
    if (!channel) {
        return;
    }

    // Check if this message was sent in the one word channel - if it wasn't then we can stop here.
    if (message.channel.id !== channel.id) {
        return;
    }

    // Check if the message is from a bot - if it is then we can stop here.
    if (message.member.user.bot) {
        return;
    }

    // Check if the message content is a single word - if it isn't then we can stop here.
    if (!message.content || message.content.trim().split(/\s+/).length !== 1) {
        message.delete();
        return;
    }

    // Check if the message content is a special character or empty - if it is then we can stop here.
    if (/^[!@#$%^&*(),.?":{}|<>]$/.test(message.content) || message.content.trim() === '') {
        message.delete();
        return;
    }

    // Check if data exists in Redis for the one word game.
    const query = await redis.get(`${channel.id}_onewordchannel`);
    let data = [];
    if (query) {
        data = JSON.parse(query);
    }

    // Check if the last entry in the data is from the same user - if it is then we can stop here.
    if (data.length > 0 && data[data.length - 1].author === message.author.id) {
        message.delete();
        return;
    }

    // * Reddis Data:
    // * words: { word: String, author: Discord User ID }

    // Push the new word to the data array and update Redis.
    data.push({ word: message.content, author: message.author.id });
    await redis.set(`${channel.id}_onewordchannel`, JSON.stringify(data));

     // Detect if the author has a full stop at the end of their message so we can summarise the game so far in the channel.
    if (message.content.endsWith('.')) {
        // Map the data to get the words and join them into a string.
        const words = data.map(entry => entry.word).join(' ');
        
        // Create an embed to notify the channel of the game summary.
        const attachment = new AttachmentBuilder('src/images/quotes.png', { name: 'quotes.png' });
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('One Word Game')
            .setDescription(words)
            .setThumbnail(`attachment://${attachment.name}`)
            .setFooter({ text: `⭐ Total words: ${data.length}` })

        // Send the embed to the channel.
        channel.send({ embeds: [embed], files: [attachment] });
        return;
    }
};
