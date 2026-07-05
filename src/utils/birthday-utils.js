const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const redis = require('../config/redis');
const birthdaySchema = require('../models/birthday-schema');

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const UPCOMING_PAGE_SIZE = 8;

function isValidBirthday(day, month) {
    if (!Number.isInteger(day) || !Number.isInteger(month)) {
        return false;
    }
    if (month < 1 || month > 12) {
        return false;
    }
    if (day < 1 || day > DAYS_IN_MONTH[month - 1]) {
        return false;
    }
    return true;
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Feb 29 birthdays are announced on Feb 28 in non-leap years.
function isTodayBirthday(entry, today) {
    if (entry.month === today.month && entry.day === today.day) {
        return true;
    }
    if (entry.month === 2 && entry.day === 29 && !isLeapYear(today.year) && today.month === 2 && today.day === 28) {
        return true;
    }
    return false;
}

function getDaysUntilNext(entry, today) {
    const effectiveDay = (year) => (entry.month === 2 && entry.day === 29 && !isLeapYear(year)) ? 28 : entry.day;
    const todayMidnight = Date.UTC(today.year, today.month - 1, today.day);
    let next = Date.UTC(today.year, entry.month - 1, effectiveDay(today.year));
    if (next < todayMidnight) {
        next = Date.UTC(today.year + 1, entry.month - 1, effectiveDay(today.year + 1));
    }
    return Math.round((next - todayMidnight) / 86400000);
}

// Guild-scoped (not client.channels.cache) so a same-named channel in another guild can never match.
function getBirthdaySetChannel(guild) {
    return guild.channels.cache.find(channel => channel.name.includes('birthday-machine'));
}

function getBirthdayAnnounceChannel(guild) {
    return guild.channels.cache.find(channel => channel.name.includes('birthday-messages'));
}

async function fetchCachedMessage(guild, redisKey) {
    const cached = await redis.get(redisKey);
    if (!cached) {
        return null;
    }
    const { channelId, messageId } = JSON.parse(cached);
    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
        return null;
    }
    return channel.messages.fetch(messageId).catch(() => null);
}

function buildBirthdayPanelContent(guild) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('birthday_add').setLabel('Add Birthday').setEmoji('🎂').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('birthday_amend').setLabel('Amend Birthday').setEmoji('✏️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('birthday_delete').setLabel('Delete Birthday').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
    );

    const announceChannel = getBirthdayAnnounceChannel(guild);
    const announceChannelMention = announceChannel ? `<#${announceChannel.id}>` : 'the birthday messages channel';

    const attachment = new AttachmentBuilder('src/images/birthday-machine.png', { name: 'birthday-machine.png' });
    const embed = new EmbedBuilder()
        .setColor('Purple')
        .setTitle('🎂 Birthday Machine')
        .setDescription(`Use the buttons below to add, change, or remove your birthday.\n\nOn your birthday, a message will be posted in ${announceChannelMention} for everyone to celebrate!`)
        .setThumbnail(`attachment://${attachment.name}`)
        .setFooter({ text: '🔒 Your birth year is never asked for or stored.' });

    return { embed, row, attachment };
}

async function ensureBirthdayPanel(guild) {
    const channel = getBirthdaySetChannel(guild);
    if (!channel) {
        return;
    }

    const existing = await fetchCachedMessage(guild, `${guild.id}_birthdaypanel`);
    if (existing) {
        return;
    }

    const { embed, row, attachment } = buildBirthdayPanelContent(guild);

    channel.send({ embeds: [embed], components: [row], files: [attachment] }).then(async (message) => {
        await redis.set(`${guild.id}_birthdaypanel`, JSON.stringify({ channelId: channel.id, messageId: message.id }));
        console.log(`✅ Birthday panel posted for guild ${guild.id}.`);
    }).catch((error) => {
        console.error(`❌ Failed to post birthday panel for guild ${guild.id}:\n`, error);
    });
}

async function refreshBirthdayPanel(guild) {
    const existing = await fetchCachedMessage(guild, `${guild.id}_birthdaypanel`);
    if (!existing) {
        await ensureBirthdayPanel(guild);
        return;
    }

    const { embed, row, attachment } = buildBirthdayPanelContent(guild);
    await existing.edit({ embeds: [embed], components: [row], files: [attachment] }).catch((error) => {
        console.error(`❌ Failed to refresh birthday panel for guild ${guild.id}:\n`, error);
    });
}

async function buildUpcomingEmbed(guild, page = 0) {
    const doc = await birthdaySchema.findOne({ guildId: guild.id });
    const now = new Date();
    const today = { day: now.getUTCDate(), month: now.getUTCMonth() + 1, year: now.getUTCFullYear() };

    const embed = new EmbedBuilder()
        .setColor('Purple')
        .setTitle('🎉 Upcoming Birthdays')
        .setThumbnail('attachment://upcoming-birthdays.png');

    if (!doc || !doc.birthdays.length) {
        embed.setDescription('No birthdays have been saved yet.');
        embed.setFooter({ text: '🎈 This embed will update periodically.' });
        return { embed, page: 0, totalPages: 1 };
    }

    const sorted = doc.birthdays
        .map(entry => ({ entry, days: getDaysUntilNext(entry, today) }))
        .sort((a, b) => a.days - b.days);

    const totalPages = Math.max(1, Math.ceil(sorted.length / UPCOMING_PAGE_SIZE));
    const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
    const pageItems = sorted.slice(clampedPage * UPCOMING_PAGE_SIZE, (clampedPage + 1) * UPCOMING_PAGE_SIZE);

    const lines = pageItems.map(({ entry, days }) => {
        const monthName = new Date(Date.UTC(2000, entry.month - 1, 1)).toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' });
        const when = days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `in ${days} days`;
        return `<@${entry.userId}> - ${monthName} ${entry.day} (${when})`;
    });

    embed.setDescription(lines.join('\n'));
    embed.setFooter({ text: totalPages > 1 ? `🎈 Page ${clampedPage + 1}/${totalPages} - This embed will update periodically.` : '🎈 This embed will update periodically.' });

    return { embed, page: clampedPage, totalPages };
}

function buildUpcomingPaginationRow(page, totalPages) {
    if (totalPages <= 1) {
        return null;
    }
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('birthday_upcoming_prev').setEmoji('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId('birthday_upcoming_next').setEmoji('➡️').setStyle(ButtonStyle.Secondary).setDisabled(page >= totalPages - 1)
    );
}

async function getUpcomingPage(guild) {
    const stored = await redis.get(`${guild.id}_birthdayupcomingpage`);
    return stored ? parseInt(stored, 10) || 0 : 0;
}

async function ensureUpcomingMessage(guild) {
    const channel = getBirthdaySetChannel(guild);
    if (!channel) {
        return;
    }

    const existing = await fetchCachedMessage(guild, `${guild.id}_birthdayupcoming`);
    if (existing) {
        return;
    }

    const attachment = new AttachmentBuilder('src/images/upcoming-birthdays.png', { name: 'upcoming-birthdays.png' });
    const page = await getUpcomingPage(guild);
    const { embed, totalPages, page: clampedPage } = await buildUpcomingEmbed(guild, page);
    const row = buildUpcomingPaginationRow(clampedPage, totalPages);

    channel.send({ embeds: [embed], components: row ? [row] : [], files: [attachment] }).then(async (message) => {
        await redis.set(`${guild.id}_birthdayupcoming`, JSON.stringify({ channelId: channel.id, messageId: message.id }));
        console.log(`✅ Upcoming birthdays embed posted for guild ${guild.id}.`);
    }).catch((error) => {
        console.error(`❌ Failed to post upcoming birthdays embed for guild ${guild.id}:\n`, error);
    });
}

async function refreshUpcomingMessage(guild) {
    const existing = await fetchCachedMessage(guild, `${guild.id}_birthdayupcoming`);
    if (!existing) {
        await ensureUpcomingMessage(guild);
        return;
    }

    const attachment = new AttachmentBuilder('src/images/upcoming-birthdays.png', { name: 'upcoming-birthdays.png' });
    const page = await getUpcomingPage(guild);
    const { embed, totalPages, page: clampedPage } = await buildUpcomingEmbed(guild, page);
    const row = buildUpcomingPaginationRow(clampedPage, totalPages);

    if (clampedPage !== page) {
        await redis.set(`${guild.id}_birthdayupcomingpage`, String(clampedPage));
    }

    await existing.edit({ embeds: [embed], components: row ? [row] : [], files: [attachment] }).catch((error) => {
        console.error(`❌ Failed to refresh upcoming birthdays embed for guild ${guild.id}:\n`, error);
    });
}

module.exports = {
    isValidBirthday,
    isTodayBirthday,
    getDaysUntilNext,
    getBirthdaySetChannel,
    getBirthdayAnnounceChannel,
    ensureBirthdayPanel,
    refreshBirthdayPanel,
    ensureUpcomingMessage,
    refreshUpcomingMessage,
    buildUpcomingEmbed,
    buildUpcomingPaginationRow
};
