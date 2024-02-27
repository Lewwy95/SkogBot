const { EmbedBuilder } = require("discord.js");

module.exports = async (member) => {
    const channel = member.guild.systemChannel;

    if (!channel) {
        return;
    }

    await channel.send({
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('Welcome Handler')
            .setDescription('A new member has joined the server!')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields({
                name: 'Member',
                value: `Please give <@${member.id}> a warm welcome.`
            })
        ],
        allowedMentions: { users: [] }
    });
};