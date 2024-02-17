const memberCounterSchema = require('../../models/memberCounter');

module.exports = async (oldMember, newMember) => {
    const query = await memberCounterSchema.findOne({ guildId: newMember.guild.id });

    if (!query) {
        return;
    }

    const channel = await newMember.guild.channels.cache.find(channel => channel.id === query.channelId);

    if (!channel) {
        return;
    }

    const count = await newMember.guild.members.cache.filter(member => !member.user.bot).size;  

    channel.setName(`Member Count: ${count}`);
};