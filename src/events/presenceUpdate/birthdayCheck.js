const { EmbedBuilder } = require('discord.js');
const { giveFruit } = require('../../functions/giveFruit');
const birthdaySchema = require('../../schemas/birthdays');

module.exports = async (oldMember, newMember) => {
    const query = await birthdaySchema.findOne({ guildId: newMember.guild.id });

    if (!query) {
        console.log('birthdayCheck.js: No birthdays found in database. Skipping.');
        return;
    }

    const channel = newMember.guild.systemChannel;

    if (!channel) {
        console.log('birthdayCheck.js: No system channel found in guild. Skipping.');
        return;
    }

    const birthdayRole = newMember.guild.roles.cache.find((role) => role.name === 'Birthday');

    if (!birthdayRole) {
        console.log('birthdayCheck.js: No birthday role found in guild. Skipping.');
        return;
    }

    query.birthdays.forEach(async (value) => {
        const todayDate = new Date().toDateString().split(' ');
        const todayDay = todayDate[2];
        const todayMonth = todayDate[1];

        const storedDate = value.birthday.toDateString().split(' ');
        const storedDay = storedDate[2];
        const storedMonth = storedDate[1];

        if (todayMonth === storedMonth) {
            const member = newMember.guild.members.cache.find(member => member.id === value.userId);

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
            giveFruit(newMember.guild.id, null, member.id, 50);

            const birthdayMessage = await channel.send({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('🎂 Birthday')
                    .setDescription('It\'s someone\'s birthday.')
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .addFields({
                        name: 'Member',
                        value: `Please wish ${member.user.displayName} a happy birthday!`
                    })
                ]
            });

            birthdayMessage.react('🎉');
        }
    });
};