const memberCounterSchema = require('../../models/memberCounter');

module.exports = async (member) => {
    const query = await memberCounterSchema.findOne({ guildId: member.guild.id });

    if (!query) {
        return;
    }

    const channel = await member.guild.channels.cache.find(channel => channel.id === query.channelId);

    if (!channel) {
        return;
    }

    const count = await member.guild.members.cache.filter(member => !member.user.bot).size;  

    channel.setName(`Member Count: ${count}`);
};