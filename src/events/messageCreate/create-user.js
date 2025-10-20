const redis = require('../../config/redis');

module.exports = async (message) => {
    // Check if the message is from a bot - if it is then we can stop here.
    if (message.member.user.bot) {
        return;
    }

    // Check if account data exists in Redis for the guild and attempt to parse it.
    const query = await redis.get(`${message.guild.id}_accounts`);
    let data = [];
    if (query) {
        data = JSON.parse(query);
    }

    // Check if the message author has an account - if they don't then we create one for them.
    if (!data.some(entry => entry.userid === message.author.id)) {
        data.push({
            userid: message.author.id,
            username: message.member ? message.member.displayName : message.author.username,
            candy: 0
        });

        await redis.set(`${message.guild.id}_accounts`, JSON.stringify(data));
        return;
    }
};
