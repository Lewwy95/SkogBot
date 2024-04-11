const { giveFruit } = require('../../functions/giveFruit');
const redis = require('../../functions/redis');

module.exports = async (message) => {
    const channel = await message.client.channels.cache.find((channel) => channel.name.includes('counting'));

    if (!channel) {
        console.log('countingGame.js: No channel with "counting" exists in guild.');
        return;
    }

    if (message.channel.id !== channel.id) {
        return;
    }

    if (message.author.id === message.client.user.id) {
        return;
    }

    const query = await redis.get(message.channel.id);
    let cache;

    if (query) {
        cache = await JSON.parse(query);
    } else {
        await redis.set(message.channel.id, JSON.stringify({ 
            nextNumber: 1,
            lastUser: message.author.username
        }));

        cache = await JSON.parse(query);

        console.log('countingGame.js: No Redis cache found. Started new game.');
    }

    if (!cache) {
        console.log('countingGame.js: Unable to parse data from Redis cache. Please try again, this could be normal.');
        return;
    }

    if (isNaN(message.content)) {
        giveFruit(message.guild.id, null, message.author.id, -1);
        message.delete();
        return;
    }

    if (message.author.username === cache.lastUser) {
        giveFruit(message.guild.id, null, message.author.id, -1);
        message.delete();
        return;
    }

    if (Math.trunc(message.content) !== cache.nextNumber) {
        giveFruit(message.guild.id, null, message.author.id, -1);
        message.delete();
        return;
    }

    switch (Math.trunc(message.content)) {
        case 100: {
            await message.pin();
        }

        break;

        case 500: {
            await message.pin();
        }

        break;

        case 1000: {
            await message.pin();
        }

        break;

        case 5000: {
            await message.pin();
        }

        break;

        case 10000: {
            await message.pin();
        }

        break;
    }

    await redis.set(message.channel.id, JSON.stringify({ 
        nextNumber: Math.trunc(message.content) +1,
        lastUser: message.author.username
    }));

    giveFruit(message.guild.id, null, message.author.id, 1);
};