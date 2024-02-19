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
            parent: query.parentId,
            permissionOverwrites: [{
                    id: newState.member.id,
                    allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers]
                }
            ]
        });

        channel.send({
            content: `<@${newState.member.user.id}> is the owner of this channel.\n\nThey have extra permissions for this channel:\n- Manage Channel\n- Mute Members\n- Deafen Members\n- Move Members\n\nThis channel will be deleted once it becomes empty.`,
            allowedMentions: { users: [] }
        });

        query.channels.push({ channelId: channel.id });
    
        await query.save();

        await newState.member.voice.setChannel(channel);
    }
};