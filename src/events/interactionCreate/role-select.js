// If you are looking for the select menu spawn code then it is in "/channelCreate/role-select.js".
// This code is for handling the interaction when a user selects a role from the select menu.

module.exports = async (interaction) => {
    // Check if the interaction is a select menu - if it isn't then we can stop here.
    if (!interaction.isRoleSelectMenu()) {
        return;
    }

    // Check the select menu custom ID - if it isn't the one we need then we can stop here.
    if (interaction.customId !== 'roleSelectMenu') {
        return;
    }

    // If the user didn't select any roles then we can stop here.
    if (interaction.values.length === 0) {
        interaction.reply({ content: 'Your selection has been cleared.\nIf you are trying to remove a role then you must select the role again to trigger it.', ephemeral: true });
        return;
    }

    // Define the roles to be excluded from the select menu.
    const excludedRoles = ['skogbot', 'bot', 'moderator', 'booster', 'dev'];

    // Check if the selected role is in the excluded roles
    const selectedRole = interaction.guild.roles.cache.get(interaction.values[0]);
    if (excludedRoles.includes(selectedRole.name.toLowerCase())) {
        interaction.reply({ content: 'You are unable to select this role.', ephemeral: true });
        return;
    }

    // Check if the user has the role already - if they do then we can remove it from them.
    // If they don't have the role then we can add it to them.
    if (interaction.member.roles.cache.has(interaction.values[0])) {
        await interaction.member.roles.remove(interaction.values[0]);
    } else {
        await interaction.member.roles.add(interaction.values[0]);
    }

    // Send a reply to the interaction.
    await interaction.reply({
        content: `The <@&${interaction.values[0]}> role has been ${interaction.member.roles.cache.has(interaction.values[0]) ? 'added to' : 'removed from'} your profile.`,
        ephemeral: true
    });
};