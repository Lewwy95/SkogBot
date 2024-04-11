const { ChannelType } = require('discord.js');

module.exports = async (oldMember, newMember) => {
    const channel = await newMember.client.channels.cache.find((channel) => channel.name.includes('Count') && ChannelType.GuildVoice);

    if (!channel) {
        console.log('userCounter.js: No channel with "Count" exists in guild.');
        return;
    }

    const count = await newMember.guild.members.cache.filter(member => !member.user.bot).size;

    channel.setName(`User Count: ${count}`);
};