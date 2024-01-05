const { ChannelType, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');
const db = require('../../index');

module.exports = async (oldState, newState) => {
    // Get the voice creator configuration from the database
    const result = await db.get(`${newState.guild.id}_configs.voiceCreator`);

    // If valid voice creator configuration was found and the state was changed by a member
    if (result && !newState.member.bot) {
        // If the member joins the creator channel
        if (oldState.channel !== newState.channel && newState.channel && newState.channel.id === result.channelId) {
            // Create a new channel
            const channel = await newState.guild.channels.create({
                name: `🔊 ${newState.member.nickname ? `${newState.member.nickname}` : `${newState.member.user.username}`}'s Channel`,
                type: ChannelType.GuildVoice,
                parent: result.parentId,
                permissionOverwrites: [{
                        id: newState.member.id,
                        allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers]
                    }
                ]
            }).catch(console.error);

            // Move the member to their new channel
            await newState.member.voice.setChannel(channel).catch(console.error);

            // Check the member count of the channel
            const checkMembers = () => {
                // Get the channel from cache
                const cachedChannel = newState.guild.channels.cache.get(channel.id);

                // Clear the timer for this function if the channel no longer exists
                if (!cachedChannel) return clearTimeout(checkMembers);

                // Check the member size and delete the channel if empty
                if (cachedChannel.members.size < 1) {
                    cachedChannel.delete().catch(console.error);
                    clearTimeout(checkMembers);
                } else {
                    setTimeout(checkMembers, ms('3s'));
                }
            }

            // Set the check member count function to run on a timer
            return setTimeout(checkMembers, ms('3s'));
        }
    }
};