/*
const { EmbedBuilder } = require('discord.js');
const schedule = require('node-schedule');
const redis = require('../../config/redis');

module.exports = async (client) => {
    // Check if there is a counting channel - if there isn't then we can stop here.
    const channel = client.channels.cache.find(channel => channel.name.includes('count'));
    if (!channel) {
        return;
    }

    // Check if data exists in Redis for the counting game - if it doesn't then we can stop here.
    const query = await redis.get(`${channel.id}_countingchannel`);
    if (!query) {
        console.log(`❌ Counting game not found in Redis for channel ${channel.id}!`);
        return;
    }

    // Parse the data from Redis, store it to a variable.
    const data = await JSON.parse(query);
    if (!data) {
        console.log(`❌ No counting game data found in Redis for channel ${channel.id}!`);
        return;
    }

    // Schedule a notification to be sent 1 hour before the counting game resets.
    schedule.scheduleJob({ dayOfWeek: parseInt(data.targetDay), hour: 22, minute: 0 }, async function() {
        // Create an embed to notify the channel that the counting game will reset soon.
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Counting Game')
            .setDescription(`The game will expire in 1 hour!\nTry to reach the target before it resets.`);

        // Let the channel know that the counting game will reset soon.
        channel.send({ embeds: [embed] });
    });

    // Schedule the counting game time limit.
    schedule.scheduleJob({ dayOfWeek: parseInt(data.targetDay), hour: 23, minute: 0 }, async function() {
        // Calculate a new target day that is at least 2 days away from the current target day.
        let newTargetDay;
        do {
            newTargetDay = Math.floor(Math.random() * 7) + 1; // 1-7 (Monday to Sunday)
        } while (Math.abs(newTargetDay - parseInt(data.targetDay)) < 2);

        // Map numbers 1-7 to days of the week.
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const expiryDayName = daysOfWeek[(newTargetDay - 1) % 7];

        // Attempt to delete the latest pinned counting game message.
        try {
            const pinnedMessage = await channel.messages.fetch(data.pinnedMessage);
            pinnedMessage.delete();
        } catch (error) {
            console.error('❌ Pinned counting game message missing:\n', error);
        }

        // Create an embed to notify the channel that the counting game has ended.
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Counting Game')
            //.setDescription(`Time is up! The count has been reset to **1** and the new expiry is **${expiryDayName}** night.\nThe targeted number is still **${targetValue}** and you can attempt to reach it again!\nPlease note that the blacklist has been reset so everyone can ruin again.`);
            .setDescription(`Time is up! The count has been reset to **1** and the new expiry is **${expiryDayName}** night.\nThe targeted number is still **${targetValue}** and you can attempt to reach it again!`);

        // Let the channel know that the count was reset and pin the new message.
        const sentMessage = await channel.send({ embeds: [embed] });
        await sentMessage.pin();

        // Delete the blacklist for the counting game (if applicable).
        //await redis.del(`${channel.id}_countingchannel_blacklist`);
        
        // Reset the counting game data in Redis.
        await redis.set(`${channel.id}_countingchannel`, JSON.stringify({ currentValue: 1, targetValue: data.targetValue, lastUser: null, targetDay: newTargetDay, setBy: data.setBy, pinnedMessage: sentMessage.id }));
    });
};
*/
