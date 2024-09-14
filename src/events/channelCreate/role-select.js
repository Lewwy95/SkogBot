// The rest of this code is in "/interactionCreate/role-select.js".
// This is where we will handle the interaction when a user selects a role.

const { RoleSelectMenuBuilder, ActionRowBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');

module.exports = (channel) => {
    // Check if there is a roles channel - if there isn't then we can stop here.
    const roleChannel = channel.client.channels.cache.find(channel => channel.name.includes('role'));
    if (!roleChannel) {
        return;
    }

    // Create a role select menu for users to select roles from.
    const roleSelectMenu = new RoleSelectMenuBuilder()
        .setCustomId('roleSelectMenu')
        .setPlaceholder('Select one role at a time...')
        .setMinValues(0);
    
    // Add roles to the select menu.
	const selectMenuRow = new ActionRowBuilder()
		.addComponents(roleSelectMenu);
    
    // Create an embed with the role select menu and send it to the channel.
    const attachment = new AttachmentBuilder('src/images/role-select.png', { name: 'role-select.png' });
    const embed = new EmbedBuilder()
        .setColor('Fuchsia')
        .setTitle('Role Select')
        .setDescription('Be notified about specific topics that are important to you.')
        .setThumbnail(`attachment://${attachment.name}`)
        .addFields({
            name: 'Instructions',
            value: `1. Select any roles that you want from the menu below.\n2. If you want to remove a role then select it again.`
        });

    // Here we send the embed to the channel!
    roleChannel.send({
        embeds: [embed],
        components: [selectMenuRow],
        files: [attachment]
    });
};