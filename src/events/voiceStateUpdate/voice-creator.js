const { ChannelType, PermissionFlagsBits } = require('discord.js');
const redis = require('../../config/redis');

// List of names for the custom channels - feel free to add more names to the list!
const names = [
    'Bit Bistro',
    'Quantum Quarters',
    'Pixel Plaza',
    'Frame Factory',
    'Echo Enclave',
    'Node Niche',
    'Stack Station',
    'Cache Cabin',
    'Portal Parlor',
    'LAN Lounge',
    'Ping Pavilion',
    'Render Room',
    'Sprite Suite',
    'Patch Pad',
    'Compile Corner',
    'Module Manor',
    'Sandbox Suite',
    'Thread Theater',
    'Buffer Bay',
    'Kernel Keep'
];

module.exports = async (oldState, newState) => {
    // Check for all voice channels with "Create" in the name and store their id to an array.
    const creatorChannels = await newState.client.channels.cache.filter((channel) => channel.name.includes('Create') && ChannelType.GuildVoice).map((channel) => channel.id);

    // If the guild has no creator channels or if the user is a bot then we can stop here.
    if (newState.channel && creatorChannels.length < 1 || newState.member.user.bot) {
        return;
    }

    // If the user didn't join or leave a creator channel then we can stop here.
    if(newState.channel && !creatorChannels.some(id => newState.channel && newState.channel.id === id)) {
        return;
    }

    // Check if the user joined the creator channel - if they did then we create a new channel for them.
    if (oldState.channel !== newState.channel && newState.channel && newState.channel.id === newState.channel.id) {
        const channel = await newState.guild.channels.create({
            name: names[Math.floor(Math.random() * names.length)],
            type: ChannelType.GuildVoice,
            parent: newState.channel.parentId,
            permissionOverwrites: [{
                    id: newState.member.id,
                    allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers]
                }
            ]
        });

        // Move the user to the new channel and save the data to Redis.
        newState.member.voice.setChannel(channel);
        await redis.set(`${channel.id}_customchannel`, JSON.stringify({ user: newState.member.user.displayName }));

        // Check if the channel parent has "LFG" in the name.
        if (channel.parent.name.includes('Looking For')) {
            // Check if the role "LFG" exists in the guild - if it doesn't then we can stop here.
            const role = newState.guild.roles.cache.find(role => role.name.includes('LFG'));
            if (!role) {
                return;
            }

            // Adjust the channel permissions to allow the "LFG" role to view and connect to the channel but not everyone else.
            channel.permissionOverwrites.create(newState.guild.roles.everyone, { ViewChannel: false, Connect: false });
            channel.permissionOverwrites.create(role, { ViewChannel: true, Connect: true });
        }
    }

    // Here we check if the user left any voice channel - we also check if the channel is a custom channel and if it is empty!
    // Then we delete the channel and remove the data from Redis.
    if (oldState.channel) {
        const query = await redis.get(`${oldState.channel.id}_customchannel`);
        if (!query) {
            return;
        }

        if (oldState.channel.members.size < 1) {
            oldState.channel.delete();
            await redis.del(`${oldState.channel.id}_customchannel`);
        }
    }
};
