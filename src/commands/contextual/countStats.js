const { ApplicationCommandType, EmbedBuilder } = require("discord.js");
const db = require('../../index');
 
module.exports = {
    data: {
        name: 'Counting Game Stats',
        type: ApplicationCommandType.User,
    },
 
    run: async ({ interaction }) => {
        // Keep the member waiting while the command is processing
        await interaction.deferReply({ ephemeral: true });

        // Get the counting game configuration from the database
        const result = await db.get(`${interaction.guild.id}_configs.count`);

        // Return an error message if no counting configuration was found
        if (!result) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ No counting game configuration was found.')
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Check for member data in the database
        const data = await db.get(`${interaction.guild.id}_members.${interaction.targetUser.username}`);

        // Return an error message if no profile was found for the member
        if (!data) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ That member does not exist in the database.')
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Send the stats to the requesting member
        return await interaction.followUp({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('👑 Statistics')
                .setDescription(`Counting Game stats for <@${interaction.targetUser.id}>.`)
                .setThumbnail(interaction.targetUser.displayAvatarURL({ dynamic: true }))
                .addFields({
                    name: 'Contributions',
                    value: `\`${data.countContributions ? data.countContributions : '0'}\``,
                    inline: true
                }, {
                    name: 'Successful Resets',
                    value: `\`${data.countSuccessfulResets ? data.countSuccessfulResets : '0'}\``,
                    inline: true
                }, {
                    name: 'Failed Resets',
                    value: `\`${data.countFailedResets ? data.countFailedResets : '0'}\``,
                    inline: true
                })
            ],
            ephemeral: true
        }).catch(console.error);
    },
 
    options: {
        dm_permission: false
    }
};