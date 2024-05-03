const { EmbedBuilder } = require('discord.js');
const redis = require('../../functions/redis');

module.exports = async (interaction) => {
    if (!interaction.isButton()) {
        return;
    }

    if (interaction.customId === 'authApprove' || interaction.customId === 'authDeny') {
        const query = await redis.get(interaction.message.id);
        const cache = await JSON.parse(query);
        const user = await interaction.guild.members.cache.get(cache.userId);
        const cocChannel = await interaction.guild.channels.cache.find((channel) => channel.name.includes('conduct'));

        if (!user) {
            interaction.reply({
                content: 'The user that you are trying to process does not exist.',
                ephemeral: true
            });
            return;
        }

        if (!cocChannel) {
            interaction.reply({
                content: 'The Code of Conduct channel does not exist.',
                ephemeral: true
            });
            return;
        }

        if (!user.kickable) {
            interaction.reply({
                content: 'The user that you are trying to process is too powerful.',
                ephemeral: true
            });
            return;
        }

        if (interaction.customId === 'authApprove') {
            cocChannel.permissionOverwrites.edit(user, {
                'ViewChannel': true,
                'SendMessages': false,
                'AddReactions': false
            });

            interaction.channel.send(`${user.displayName} was granted authorisation <t:${Math.floor((Date.now() - 5000) / 1000)}:R> by ${interaction.user.displayName}.`);

            const channel = await interaction.guild.channels.cache.find((channel) => channel.name.includes('security'));

            if (channel) {
                const message = await channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('Purple')
                        .setTitle('🚨 Security Alert')
                        .setDescription(`${user.displayName} has entered through the gates of ${interaction.guild.name}.`)
                        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                        .addFields({
                            name: 'Details',
                            value: `They were authorised by ${interaction.user.displayName} approximately <t:${Math.floor((Date.now() - 5000) / 1000)}:R>.`
                        })
                    ]
                });

                message.react('👋');
            } else {
                console.log('authProcess.js: No channel with "security" exists in guild.');
            }
        }

        if (interaction.customId === 'authDeny') {
            await user.kick();
            interaction.channel.send(`${user.displayName} was denied authorisation <t:${Math.floor((Date.now() - 5000) / 1000)}:R> by ${interaction.user.displayName}.`);
        }

        interaction.message.delete();
        await redis.del(interaction.message.id);
    }
};