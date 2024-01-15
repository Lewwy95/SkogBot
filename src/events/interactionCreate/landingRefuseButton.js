const { EmbedBuilder } = require('discord.js');
const db = require('../../index');

module.exports = async (interaction) => {
    // Do nothing if the interaction is not a button
    if (!interaction.isButton()) return;

    // Handle if the instigator clicked the refuse access button
    if (interaction.customId === 'landingRefuseAccess') {
        // Keep the member waiting while the interaction is processing
        await interaction.deferReply({ ephemeral: true });

        // Get the Verified role from the database
        const result = await db.get(`${interaction.guild.id}_configs.landing`);

        // Return an error to the instigator if no entry was found
        if (!result.modRoleId) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ You can\'t refuse access until the Moderator role has been set up.')
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Create a variable to check whether or not the instigator has the Moderator role
        const hasModRole = await interaction.member.roles.cache.some(role => role.id === result.modRoleId);

        // Return an error to the instigator if they are not a Moderator
        if (!hasModRole) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription(`❌ Only a member with the <@&${result.modRoleId}> role can refuse access.`)
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Get the requesting member from the database
        const data = await db.get(`${interaction.guild.id}_data.accessReq_${interaction.channel.id}`);

        // Fetch the requesting member from cache
        const target = await interaction.guild.members.fetch(`${data.accessReqUserId}`);

        // Return an error to the instigator if the member failed to fetch from the database
        if (!target) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription(`❌ The member profile could not be found in the database.`)
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Create a variable to check whether or not the requesting member has the Verified role
        const hasVerifiedRole = await target.roles.cache.some(role => role.id === result.verifiedRoleId);

        // Return an error to the instigator if the requesting member is already verified
        if (hasVerifiedRole) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription(`❌ That member already has the <@&${result.verifiedRoleId}> role.`)
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Return an error if the target is not kickable
        if (!target.kickable) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ You can\'t refuse this member\'s access as I can\'t kick them.')
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Remove the requesting member's data in the database
        await db.delete(`${interaction.guild.id}_members.${target.user.username}`);

        // Remove the request in the database
        await db.delete(`${interaction.guild.id}_data.accessReq_${interaction.channel.id}`);

        // Kick the target
        await target.kick('Refused Access');

        // Delete the reply
        await interaction.deleteReply();

        // Delete the channel
        return await interaction.channel.delete().catch(console.error);
    }
};