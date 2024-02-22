const { EmbedBuilder } = require("discord.js");

module.exports = async (oldMember, newMember) => {
    const channel = newMember.guild.systemChannel;

    if (!channel) {
        return;
    }

    const verifiedRole = newMember.guild.roles.cache.find((role) => role.name === 'Verified');

    if (!verifiedRole) {
        return;
    }

    const hasVerifiedRole = await newMember.roles.cache.some(role => role.id === verifiedRole.id);

    if (hasVerifiedRole && oldMember.roles.cache.some(role => role.id !== verifiedRole.id)) {
        await channel.send({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('Welcome Handler')
                .setDescription('A new member has joined the server!')
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                .addFields({
                    name: 'Member',
                    value: `Please give <@${newMember.id}> a warm welcome.`
                })
            ],
            allowedMentions: { users: [] }
        });
    }
};