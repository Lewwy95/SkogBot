const { giveFruit } = require('../../functions/giveFruit');
const countingGameSchema = require('../../models/countingGame');

module.exports = async (message) => {
    const query = await countingGameSchema.findOne({ guildId: message.guild.id });

    if (!query) {
        return;
    }

    if (message.channel.id !== query.channelId) {
        return;
    }

    if (message.author.id === message.client.user.id) {
        return;
    }

    if (isNaN(message.content)) {
        message.delete();
        return;
    }

    if (message.author.username === query.lastMember) {
        message.delete();
        return;
    }

    if (Math.trunc(message.content) !== query.nextNumber) {
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

    await query.updateOne({ 
        nextNumber: Math.trunc(message.content) +1,
        lastMember: message.author.username
    });

    await giveFruit(message.guild.id, message.author.id, 1);
};