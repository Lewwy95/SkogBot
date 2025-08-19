const { EmbedBuilder } = require('discord.js');
const redis = require('../../config/redis');

module.exports = async (message) => {
    // Check if there is a counting channel - if there isn't then we can stop here.
    const channel = message.client.channels.cache.find(channel => channel.name.includes('count'));
    if (!channel) {
        return;
    }

    // Check if this message was sent in the counting channel - if it wasn't then we can stop here.
    if (message.channel.id !== channel.id) {
        return;
    }

    // Check if the message content is a number and not zero or below.
    if (isNaN(message.content) || parseInt(message.content) <= 0) {
        return;
    }

    // Check if the message is from a bot - if it is then we can stop here.
    if (message.member.user.bot) {
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

    // * Reddis Data:
    // * currentValue: Number (starts at 1)
    // * targetValue: Number
    // * lastUser: Discord User ID
    // * targetDay: Number
    // * setBy: Discord User ID
    // * pinnedMessage: Latest Pinned Message ID

    // Check if the message author is the last user to send a message in the counting channel.
    if (data.lastUser === message.author.id) {
        message.delete();
        return;
    }

    // If the number is not the expected number, reset the count.
    if (parseInt(message.content) !== data.currentValue) {
        // Fetch the user blacklist from Redis and parse the data.
        const blacklistQuery = await redis.get(`${channel.id}_countingchannel_blacklist`);
        let blacklistData = [];
        if (blacklistQuery) {
            blacklistData = JSON.parse(blacklistQuery);
        }

        // Here we check if the user who ruined the game is blacklisted - we'll ignore them if they are and delete their message.
        const isBlacklisted = blacklistData.includes(message.author.id);
        if (isBlacklisted) {
            message.delete();
            return;
        }

        // Create an embed to notify the channel of the wrong number.
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Counting Game')
            .setDescription(`Wrong number! The count has been reset to **1**.\n${message.author.displayName} has been blacklisted from ruining the game.`)

        // Let the channel know that the count was reset.
        channel.send({ embeds: [embed] });

        // Add the user to the blacklist.
        blacklistData.push(message.author.id);
        await redis.set(`${channel.id}_countingchannel_blacklist`, JSON.stringify(blacklistData));

        // Reset the counting game in Redis.
        await redis.set(`${channel.id}_countingchannel`, JSON.stringify({ currentValue: 1, targetValue: data.targetValue, lastUser: message.author.id, targetDay: data.targetDay, setBy: data.setBy, pinnedMessage: data.pinnedMessage }));
        return;
    }

    // Check if the target value has been reached.
    if (parseInt(message.content) >= data.targetValue) {
        // If the target value has been reached, increase the target value plus a random percentage between 10% and 20%.
        const increasePercent = Math.random() * (0.2 - 0.1) + 0.1;
        const newTargetValue = Math.floor(data.targetValue * (1.5 + increasePercent));

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

        // Create an embed to notify the channel of the reached target.
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Counting Game')
            .setDescription(`Well done! The next target is **${newTargetValue}** which will expire on **${expiryDayName}** night.\nPlease note that the blacklist has been reset so everyone can ruin again!`)

        // Let the channel know that the target was reached and what the new target is.
        const sentMessage = await channel.send({ embeds: [embed] });
        await sentMessage.pin();

        // Delete the blacklist for the counting game.
        await redis.del(`${channel.id}_countingchannel_blacklist`);

        // Reset the counting game in Redis.
        await redis.set(`${channel.id}_countingchannel`, JSON.stringify({ currentValue: 1, targetValue: newTargetValue, lastUser: message.author.id, targetDay: newTargetDay, setBy: message.author.id, pinnedMessage: sentMessage.id }));
        return;
    }

    // If the number is correct, increment the current value.
    const nextValue = data.currentValue + 1;

    // Update Redis with the next expected number.
    await redis.set(`${channel.id}_countingchannel`, JSON.stringify({ currentValue: nextValue, targetValue: data.targetValue, lastUser: message.author.id, targetDay: data.targetDay, setBy: data.setBy, pinnedMessage: data.pinnedMessage }));
};
