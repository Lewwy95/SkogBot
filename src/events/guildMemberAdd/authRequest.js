const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const redis = require('../../functions/redis');

module.exports = async (member) => {
    const channel = await member.guild.channels.cache.find((channel) => channel.name.includes('action-centre'));

    if (!channel) {
        console.log('authRequest.js: No channel with "action-centre" exists in guild.');
        return;
    }

    const authApprove = new ButtonBuilder()
	    .setCustomId('authApprove')
		.setLabel('Approve')
		.setStyle(ButtonStyle.Success);

    const authDeny = new ButtonBuilder()
	    .setCustomId('authDeny')
		.setLabel('Deny')
		.setStyle(ButtonStyle.Danger);

	const buttonRow = new ActionRowBuilder()
	    .addComponents(authApprove, authDeny);

    const message = await channel.send({
        content: `@here ${member.user.displayName} requested authorisation <t:${Math.floor((Date.now() - 5000) / 1000)}:R>.`,
        components: [buttonRow]
    });

    await redis.set(message.id, JSON.stringify({ userId: member.user.id }));
};