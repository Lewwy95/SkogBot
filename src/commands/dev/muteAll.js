const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute-all')
        .setDescription('Change the mute status of all users that are currently connected to your voice channel.')
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
                if (!member.voice.serverMute) {
                    member.voice.setMute(true);
                } else {
                    member.voice.setMute(false);
                }
            } catch {
                console.log('muteAll.js: Error occurred when changing mute status of a user. Skipping.');
            }
        });

        interaction.reply({
            content: `I have changed the mute status of all users that are currently connected to the <#${channel.id}> channel.`,
            ephemeral: true
        });
    }
};