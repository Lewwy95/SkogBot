const { EmbedBuilder, RoleSelectMenuBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const db = require('../../index');

module.exports = async (interaction) => {
    // Do nothing if the interaction is not a button
    if (!interaction.isButton()) return;

    // Handle if the instigator clicked the grant access button
    if (interaction.customId === 'landingGrantAccess') {
        // Keep the member waiting while the interaction is processing
        await interaction.deferReply({ ephemeral: true });

        // Get the Verified role from the database
        const result = await db.get(`${interaction.guild.id}_configs.landing`);

        // Return an error to the instigator if no entry was found
        if (!result.verifiedRoleId) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ You can\'t grant access until the Verified role has been set up.')
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Return an error to the instigator if no entry was found
        if (!result.modRoleId) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ You can\'t grant access until the Moderator role has been set up.')
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
                    .setDescription(`❌ Only a member with the <@&${result.modRoleId}> role can grant access.`)
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

        // Create a variable to check whether or not the requesting member has the roles
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

        // Delete the reply
        await interaction.deleteReply();

        // Create a role select menu
        const roleSelect = new RoleSelectMenuBuilder()
	        .setCustomId('landingGiveRole')
            .setPlaceholder('Choose a role...')

        // Bundle the row select menu into a row
        const menuRow = new ActionRowBuilder()
		    .addComponents(roleSelect)
        
        // Send the select menu to the instigator
        const msg = await interaction.channel.send({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setDescription(`👇 Please wait while a <@&${result.modRoleId}> assigns you a role.`)
            ],
            components: [menuRow]
        });

        // Hacky way to get the select menu value once selected
        const collector = await msg.createMessageComponentCollector({ componentType: ComponentType.RoleSelect });

        // Listen for menu selects
        collector.on('collect', async (interaction) => {
            // If the interaction is within the role select menu
            if (interaction.customId === 'landingGiveRole') {
                // Create a variable to check whether or not the instigator has the Moderator role
                const hasModRole = await interaction.member.roles.cache.some(role => role.id === result.modRoleId);

                // Return an error to the instigator if they are not a Moderator
                if (!hasModRole) {
                    return await interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setColor('Purple')
                            .setDescription(`❌ Only a member with the <@&${result.modRoleId}> role can assign roles.`)
                        ],
                        ephemeral: true
                    }).catch(console.error);
                }

                // Create a variable to check whether or not the requesting member has the role
                const hasRole = await target.roles.cache.some(role => role.id === interaction.values[0]);

                // Return an error to the instigator if the requesting member is already verified
                if (hasRole) {
                    return await interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setColor('Purple')
                            .setDescription(`❌ That member already has the <@&${interaction.values[0]}> role.`)
                        ],
                        ephemeral: true
                    }).catch(console.error);
                }

                // Return an error to the instigator if blacklisted roles were selected
                if (interaction.values[0] === result.verifiedRoleId || interaction.values[0] === result.modRoleId) {
                    return await interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setColor('Purple')
                            .setDescription(`❌ You can\'t give this member the <@&${interaction.values[0]}> role.`)
                        ],
                        ephemeral: true
                    }).catch(console.error);
                }

                // Disable the menu if clicked
                roleSelect.setDisabled(true);
 
                // Remove the requesting member's request click in the database
                await db.delete(`${interaction.guild.id}_members.${target.user.username}`);

                // Remove the request in the database
                await db.delete(`${interaction.guild.id}_data.accessReq_${interaction.channel.id}`);

                // Give the requesting member the roles
                await target.roles.add(result.verifiedRoleId);
                await target.roles.add(interaction.values[0]);

                // Delete the channel
                await interaction.channel.delete().catch(console.error);
            }
        });

        return;
    }
};