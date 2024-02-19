const voiceCreatorSchema = require('../../models/voiceCreator');

module.exports = async (oldState, newState) => {
    if (!oldState.channel) {
        return;
    }

    const query = await voiceCreatorSchema.findOne({ guildId: newState.guild.id });

    if (!query) {
        return;
    }

    query.channels.forEach(async (value) => {
        if (oldState.channel.id === value.channelId && oldState.channel.members.size < 1) {
            query.channels.pull({ channelId: oldState.channel.id });
        
            await query.save();
            
            await oldState.channel.delete();
        }
    });
};