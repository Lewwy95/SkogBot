const { ChannelType, PermissionFlagsBits } = require('discord.js');
const redis = require('../../config/redis');

// List of names for the custom channels - feel free to add more names to the list!
const names = [
    'Loot Lounge',
    'Frag Forge',
    'GPU Gala',
    'Chuckle Chamber',
    'Hilarity Hangar',
    'Glitch Gig',
    'Warp Way',
    'Pixel Pit',
    'Quest Quarters',
    'Code Cave',
    'Byte Bunker',
    'Tech Tavern',
    'Nerd Nook',
    'Hack Haven',
    'Debug Den',
    'Script Sanctuary',
    'Data Dungeon',
    'Syntax Salon',
    'Algorithm Alley',
    'Function Fortress'
];

module.exports = async (oldState, newState) => {
    // Check if there is a creator channel - if there isn't then we can stop here!
    const creator = await newState.client.channels.cache.find((channel) => channel.name.includes('Create') && ChannelType.GuildVoice);
    if (!creator || newState.member.bot) {
        return;
    }

    // Check if the user joined the creator channel - if they did then we create a new channel for them.
    if (oldState.channel !== newState.channel && newState.channel && newState.channel.id === creator.id) {
        const channel = await newState.guild.channels.create({
            name: names[Math.floor(Math.random() * names.length)],
            type: ChannelType.GuildVoice,
            parent: creator.parentId,
            permissionOverwrites: [{
                    id: newState.member.id,
                    allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers]
                }
            ]
        });

        // Move the user to the new channel and save the data to Redis.
        newState.member.voice.setChannel(channel);
        await redis.set(`${channel.id}_customchannel`, JSON.stringify({ user: newState.member.user.displayName }));
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