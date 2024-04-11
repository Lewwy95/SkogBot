const { EmbedBuilder } = require('discord.js');

module.exports = async (member) => {
    const channel = await member.guild.channels.cache.find((channel) => channel.name.includes('security'));

    if (channel) {
        const message = await channel.send({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('🚨 Security Alert')
                .setDescription(`${member.user.displayName} has left the kingdom of ${member.guild.name}.`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .addFields({
                    name: 'Reacts',
                    value: `Please wish them all the best for their future.`
                })
            ]
        });

        message.react('🫡');
    } else {
        console.log('authProcess.js: No channel with "security" exists in guild.');
    }
};