const { EmbedBuilder } = require('discord.js');
const db = require('../../index');

module.exports = async (interaction) => {
    // Do nothing if the interaction is not a button
    if (!interaction.isButton()) return;

    // Handle if the instigator clicked the counting game stats button
    if (interaction.customId === 'countMemberStats') {
        // Keep the member waiting while the interaction is processing
        await interaction.deferReply({ ephemeral: true });

        // Get the last member to reset the counting game from the database
        const result = await db.get(`${interaction.guild.id}_data.count.lastResetMemberId`);

        // Return an error to the instigator if no entry was found
        if (!result) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ The member that reset the counting game could not be found.')
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Fetch the member from cache
        const member = await interaction.guild.members.fetch(`${result}`).catch(console.error);

        // Return an error to the instigator if the member failed to pull from cache
        if (!member) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription(`❌ An error occurred when fetching counting game data for <${result}>.`)
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Get the counting game member data from the database
        const data = await db.get(`${interaction.guild.id}_members.${member.user.username}`);

        // Return an error to the instigator if no game data was found in the database
        if (!data) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription(`❌ No counting game statistics for <@${member.id}> were found.`)
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Send the stats to the instigator
        return await interaction.followUp({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('👑 Statistics')
                .setDescription(`Displaying statistics for <@${member.id}>.`)
                .setThumbnail(member.displayAvatarURL({ dynamic: true }))
                .addFields({
                    name: 'Contributions',
                    value: `\`${data.countContributions}\``,
                    inline: true
                }, {
                    name: 'Successful Resets',
                    value: `\`${data.countSuccessfulResets}\``,
                    inline: true
                }, {
                    name: 'Failed Resets',
                    value: `\`${data.countFailedResets}\``,
                    inline: true
                })
            ],
            ephemeral: true
        }).catch(console.error);
    }
};