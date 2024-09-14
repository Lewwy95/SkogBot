const { ChannelType, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const timers = new Map();

module.exports = async (oldVoiceState, newVoiceState) => {
    // Check if the user is streaming - if they aren't then we can stop here.
    if (!newVoiceState.streaming || !newVoiceState.channel) {
        // If the user was streaming and stopped then we need to clear the timer.
        if (timers.has(newVoiceState.id)) {
            clearTimeout(timers.get(newVoiceState.id));
            timers.delete(newVoiceState.id);
        }

        // Check if there is a live channel - if there isn't then we can stop here.
        const channel = newVoiceState.client.channels.cache.find(channel => channel.name.includes('live'));
        if (!channel) {
            return;
        }

        // Find any messages in the live channel for this user and delete them.
        const messages = await channel.messages.fetch({ limit: 100 });
        const userMessages = messages.filter(msg => msg.embeds.length > 0 && msg.embeds[0].description.includes(newVoiceState.member.user.displayName));
        if (userMessages.size > 0) {
            await channel.bulkDelete(userMessages);
        }
        return;
    }

    // If there's already a timer for this user then we don't need to set another one.
    if (timers.has(newVoiceState.id)) {
        return;
    }

    // Set a timer to check if the user is still streaming.
    const timer = setTimeout(async () => {
        // Check if the user is still streaming - if they aren't then we can stop here.
        if (!newVoiceState.streaming) {
            timers.delete(newVoiceState.id);
            return;
        }

        // Check if there is a live channel - if there isn't then we can stop here.
        const channel = newVoiceState.client.channels.cache.find(channel => channel.name.includes('live'));
        if (!channel) {
            timers.delete(newVoiceState.id);
            return;
        }

        // Check if the channel is a text channel.
        if (channel.type !== ChannelType.GuildText) {
            timers.delete(newVoiceState.id);
            return;
        }

        // Find the "Live" role in the guild - if the role doesn't exist then we can stop here.
        // We also delete the timer from the map as we don't need it anymore.
        const role = newVoiceState.guild.roles.cache.find(role => role.name.toLowerCase().includes('live'));
        if (!role) {
            console.error('❌ Live Stream role missing.');
            timers.delete(newVoiceState.id);
            return;
        }

        // Create an embed and send it to the channel.
        const attachment = new AttachmentBuilder('src/images/live.png', { name: 'live.png' });
        const embed = new EmbedBuilder()
            .setColor('Fuchsia')
            .setTitle('Live Stream')
            .setDescription(`${newVoiceState.member.user.displayName} has started a live stream!`)
            .setThumbnail(`attachment://${attachment.name}`)
            .addFields({
                name: 'Channel',
                value: `<#${newVoiceState.channel.id}>`
            });

        // Here we send the embed to the channel!
        channel.send({
            content: `<@&${role.id}>`,
            embeds: [embed],
            files: [attachment]
        });

        // Remove the timer from the map after announcing it to the channel.
        timers.delete(newVoiceState.id);
    }, 300000); // 300000 = 5 minutes.

    // Store the timer in the map.
    timers.set(newVoiceState.id, timer);
};