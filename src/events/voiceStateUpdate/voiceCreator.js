const { ChannelType, PermissionFlagsBits } = require('discord.js');
const voiceCreatorsSchema = require('../../models/voiceCreators');

module.exports = async (oldState, newState) => {
    try {
        const query = { guildId: newState.guild.id };

        const voiceCreatorExists = await voiceCreatorsSchema.exists(query);

        if (!voiceCreatorExists) {
            return;
        }

        if (newState.member.bot) {
            return;
        }

        const data = await voiceCreatorsSchema.findOne({ ...query });

        if (oldState.channel !== newState.channel && newState.channel && newState.channel.id === data.channelId) {
            const channel = await newState.guild.channels.create({
                name: `🔊 ${newState.member.displayName ? `${newState.member.displayName}` : `${newState.member.user.username}`} Channel`,
                type: ChannelType.GuildVoice,
                parent: data.parentId,
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
                    setTimeout(checkMembers, 3000);
                }
            }

            setTimeout(checkMembers, 3000);
        }
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};