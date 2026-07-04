const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const birthdaySchema = require('../models/birthday-schema');
const redis = require('../config/redis');
const { isTodayBirthday, getBirthdayAnnounceChannel, refreshUpcomingMessage } = require('../utils/birthday-utils');

const CELEBRATION_LINES = [
    '"Ah shit, another birthday - here we go again."',
    '"I\'ll have two slices of cake, a birthday large, one with extra candles, a number 7, two party poppers, one with sprinkles, and a large soda."',
    '"I am the nightmare that keeps you awake, plotting your surprise party at 3am."',
    '"You know what your problem is? You still act like you\'re not a year older today."',
    '"I came here looking for cake, and by God, I\'m getting some today."'
];

async function runDailyBirthdayJob(client) {
    const now = new Date();
    const today = { day: now.getUTCDate(), month: now.getUTCMonth() + 1, year: now.getUTCFullYear() };

    for (const guild of client.guilds.cache.values()) {
        try {
            const doc = await birthdaySchema.findOne({ guildId: guild.id });
            if (doc && doc.birthdays.length) {
                const channel = getBirthdayAnnounceChannel(guild);
                if (channel) {
                    const matches = doc.birthdays.filter(entry => isTodayBirthday(entry, today));
                    for (const entry of matches) {
                        // Guards against the same person being announced twice on the same day -
                        // e.g. if the job somehow gets triggered more than once (duplicate/overlapping
                        // bot instances, a restart, manual re-invocation) it can never double-post.
                        const dateStamp = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
                        const announcedKey = `${guild.id}_${entry.userId}_${dateStamp}_birthdayannounced`;
                        const alreadyAnnounced = await redis.get(announcedKey);
                        if (alreadyAnnounced) {
                            continue;
                        }
                        await redis.set(announcedKey, '1', 'EX', 172800);
                        await announceBirthday(guild, channel, entry);
                    }
                }
            }
            await refreshUpcomingMessage(guild);
        } catch (error) {
            console.error(`❌ Birthday daily job failed for guild ${guild.id}:\n`, error);
        }
    }
}

async function announceBirthday(guild, channel, entry) {
    const member = guild.members.cache.get(entry.userId) || await guild.members.fetch(entry.userId).catch(() => null);
    if (!member) {
        return;
    }

    const joinedTimestamp = member.joinedAt ? Math.floor(member.joinedAt.getTime() / 1000) : null;
    const flavorText = CELEBRATION_LINES[Math.floor(Math.random() * CELEBRATION_LINES.length)];

    const attachment = new AttachmentBuilder('src/images/birthday-message.png', { name: 'birthday-message.png' });
    const embed = new EmbedBuilder()
        .setColor('Purple')
        .setAuthor({ name: guild.name, iconURL: guild.iconURL() ?? undefined })
        .setTitle('🎉🎂 Happy Birthday! 🎂🎉')
        .setDescription(`Everyone wish ${member} a very happy birthday!\n\n*${flavorText}*`)
        .setThumbnail(member.displayAvatarURL({ dynamic: true }))
        .setImage(`attachment://${attachment.name}`)
        .addFields(
            { name: 'Member Since', value: joinedTimestamp ? `<t:${joinedTimestamp}:D>` : 'Unknown', inline: true }
        )
        .setFooter({ text: '🎈 Have an amazing year ahead!' })
        .setTimestamp();

    channel.send({ embeds: [embed], files: [attachment] }).then((message) => {
        console.log(`✅ Birthday announcement sent for ${member.displayName} in guild ${guild.id}.`);
        message.react('🎉').catch((error) => console.error(`❌ Failed to react to birthday announcement for ${member.displayName}:\n`, error));
    }).catch((error) => {
        console.error(`❌ Failed to send birthday announcement for ${member.displayName}:\n`, error);
    });
}

module.exports = { runDailyBirthdayJob };
