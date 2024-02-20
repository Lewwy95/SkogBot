const { EmbedBuilder } = require('discord.js');
const birthdaySchema = require('../../models/birthday');
const birthday = require('../../models/birthday');

module.exports = async (oldMember, newMember) => {
    const query = await birthdaySchema.findOne({ guildId: newMember.guild.id });

    if (!query) {
        return;
    }

    const channel = newMember.guild.systemChannel;

    if (!channel) {
        return;
    }

    const birthdayRole = newMember.guild.roles.cache.find((role) => role.name === 'Birthday');

    if (!birthdayRole) {
        return;
    }

    query.birthdays.forEach(async (value) => {
        const todayDate = new Date().toDateString().split(' ');
        const todayDay = todayDate[2];
        const todayMonth = todayDate[1];

        const storedDate = value.date.toDateString().split(' ');
        const storedDay = storedDate[2];
        const storedMonth = storedDate[1];

        if (todayMonth === storedMonth) {
            const member = newMember.guild.members.cache.find(member => member.id === value.memberId);

            if (!member) {
                return;
            }

            const hasBirthdayRole = await member.roles.cache.some(role => role.id === birthdayRole.id);

            if (hasBirthdayRole && todayDay !== storedDay) {
                await member.roles.remove(birthdayRole.id);
                return;
            }

            if (hasBirthdayRole && todayDay === storedDay) {
                return;
            }

            if (todayDay !== storedDay) {
                return;
            }

            await member.roles.add(birthdayRole.id);

            await channel.send({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('Birthday Handler')
                    .setDescription('It\'s someone\'s birthday!')
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .addFields({
                        name: 'Member',
                        value: `Please wish <@${member.id}> a happy birthday.`
                    })
                ],
                allowedMentions: { users: [] }
            });
        }
    });
};