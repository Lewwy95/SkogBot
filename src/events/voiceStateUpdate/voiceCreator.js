const { ChannelType, PermissionFlagsBits } = require('discord.js');
const voiceCreatorSchema = require('../../models/voiceCreator');

module.exports = async (oldState, newState) => {
    const query = await voiceCreatorSchema.findOne({ guildId: newState.guild.id });

    if (!query) {
        return;
    }

    if (newState.member.bot) {
        return;
    }

    if (oldState.channel !== newState.channel && newState.channel && newState.channel.id === query.channelId) {
        const channel = await newState.guild.channels.create({
            name: `🔊 ${newState.member.displayName ? `${newState.member.displayName}` : `${newState.member.user.username}`} Channel`,
            type: ChannelType.GuildVoice,
            parent: query.parentId,
            permissionOverwrites: [{
                    id: newState.member.id,
                    allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers]
                }
            ]
        });

        await newState.member.voice.setChannel(channel);

        const checkMembers = async () => {
            const cachedChannel = newState.guild.channels.cache.get(channel.id);

            if (!cachedChannel) {
                clearTimeout(checkMembers);
                return;
            }

            if (cachedChannel.members.size < 1) {
                await cachedChannel.delete();

                clearTimeout(checkMembers);
            } else {
                setTimeout(checkMembers, 60000); // 1 minute
            }
        }

        setTimeout(checkMembers, 60000); // 1 minute
    }
};