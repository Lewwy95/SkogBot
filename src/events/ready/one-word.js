const { EmbedBuilder } = require('discord.js');
const schedule = require('node-schedule');
const redis = require('../../config/redis');

module.exports = async (client) => {
    // Check if there is a one word channel - if there isn't then we can stop here.
    const channel = client.channels.cache.find(channel => channel.name.includes('one-word'));
    if (!channel) {
        return;
    }

    // Check if data exists in Redis for the one word game - if it doesn't then we can stop here.
    const query = await redis.get(`${channel.id}_onewordchannel`);
    if (!query) {
        console.log(`❌ One word game not found in Redis for channel ${channel.id}!`);
        return;
    }

    // Schedule the one word game to reset every day.
    schedule.scheduleJob({ hour: 23, minute: 0 }, async function() {
        // Create an embed to notify the channel that the one word game has been reset.
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('One Word Game')
            .setDescription(`The game has been reset! Start a new game by sending a single word.`);

        // Let the channel know that the one word was reset.
        channel.send({ embeds: [embed] });

        // Delete the data from Redis.
        await redis.del(`${channel.id}_onewordchannel`);
    });
};
