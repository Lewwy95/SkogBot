const { ChannelType, PermissionFlagsBits } = require('discord.js');
const redis = require('../../functions/redis');

module.exports = async (oldState, newState) => {
    const creatorChannel = await newState.client.channels.cache.find((channel) => channel.name.includes('Create') && ChannelType.GuildVoice);

    if (!creatorChannel) {
        console.log('voiceCreator.js: No channel with "create" exists in guild.');
        return;
    }

    if (newState.member.bot) {
        return;
    }

    if (oldState.channel !== newState.channel && newState.channel && newState.channel.id === creatorChannel.id) {
        const channelName = [
            'Loot Lounge',
            'Frag Forge',
            'GPU Gala',
            'Chuckle Chamber',
            'Hilarity Hangar',
            'Glitch Gig',
            'Warp Way',
            'Pixel Pit',
            'Quest Quarters'
        ];

        const channel = await newState.guild.channels.create({
            name: `🔊 ${channelName[Math.floor(Math.random() * channelName.length)]}`,
            type: ChannelType.GuildVoice,
            parent: creatorChannel.parentId,
            permissionOverwrites: [{
                    id: newState.member.id,
                    allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers]
                }
            ]
        });

        channel.send(`${newState.member.user.displayName} is the owner of this channel.\n\nThey have extra permissions for this channel:\n- Manage Channel\n- Mute Members\n- Deafen Members\n- Move Members\n\nThis channel will be deleted once it becomes empty.`);

        await redis.set(channel.id, JSON.stringify({ user: newState.member.user.username }));

        await newState.member.voice.setChannel(channel);
    }

    if (oldState.channel) {
        const query = await redis.get(oldState.channel.id);

        if (!query) {
            return;
        }

        if (oldState.channel.members.size < 1) {
            oldState.channel.delete();
            await redis.del(oldState.channel.id);
        }
    }
};