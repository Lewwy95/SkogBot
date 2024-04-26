const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deafen-all')
        .setDescription('Change the deafen status of all users that are currently connected to your voice channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
 
    run: ({ interaction }) => {
        const channel = interaction.member.voice.channel;

        if (!channel) {
            interaction.reply({
                content: 'You are not currently connected to a voice channel.',
                ephemeral: true
            });
            return;
        }

        channel.members.forEach((member) => {
            if (member.user.id === interaction.user.id) {
                return;
            }

            try {
                if (!member.voice.serverDeaf) {
                    member.voice.setDeaf(true);
                } else {
                    member.voice.setDeaf(false);
                }
            } catch {
                console.log('deafenAll.js: Error occurred when changing deafen status of a user. Skipping.');
            }
        });

        interaction.reply({
            content: `I have changed the deafen status of all users that are currently connected to the <#${channel.id}> channel.`,
            ephemeral: true
        });
    }
};