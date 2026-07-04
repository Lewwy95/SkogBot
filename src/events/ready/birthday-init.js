const schedule = require('node-schedule');
const cronParser = require('cron-parser');
const { birthdayCronTime, birthdayTimezone, birthdayUpcomingRefreshInterval } = require('../../config/cross-env');
const { refreshBirthdayPanel, refreshUpcomingMessage } = require('../../utils/birthday-utils');
const { runDailyBirthdayJob } = require('../../jobs/birthday-cron');

// A malformed or missing cron rule doesn't throw - node-schedule silently falls back to
// firing every minute instead. Validate before scheduling so that can never happen unnoticed.
function isValidCronRule(rule) {
    try {
        cronParser.parseExpression(rule);
        return typeof rule === 'string' && rule.trim().length > 0;
    } catch {
        return false;
    }
}

module.exports = async (client) => {
    for (const guild of client.guilds.cache.values()) {
        // Both refresh functions repost if missing and edit in place if they already exist,
        // so both stay in sync with the current code on every startup, not just on first-ever post.
        await refreshBirthdayPanel(guild).catch((error) => console.error(`❌ Birthday panel setup failed for guild ${guild.id}:\n`, error));
        await refreshUpcomingMessage(guild).catch((error) => console.error(`❌ Upcoming birthdays setup failed for guild ${guild.id}:\n`, error));
    }

    if (!schedule.scheduledJobs['birthday-daily']) {
        if (!isValidCronRule(birthdayCronTime)) {
            console.error(`❌ BIRTHDAY_CRON_TIME is missing or invalid ("${birthdayCronTime}") - refusing to schedule the daily birthday cron to avoid it misfiring every minute.`);
        } else {
            schedule.scheduleJob('birthday-daily', { rule: birthdayCronTime, tz: birthdayTimezone }, () => runDailyBirthdayJob(client));
            console.log(`✅ Birthday daily cron scheduled (${birthdayCronTime} ${birthdayTimezone}).`);
        }
    }

    // Safety net: button clicks already refresh the embed, but this catches anything else that
    // changes the birthdays collection outside that flow (manual DB edits, missed/failed refreshes).
    if (!schedule.scheduledJobs['birthday-upcoming-refresh']) {
        if (!isValidCronRule(birthdayUpcomingRefreshInterval)) {
            console.error(`❌ BIRTHDAY_UPCOMING_REFRESH_INTERVAL is missing or invalid ("${birthdayUpcomingRefreshInterval}") - refusing to schedule the periodic refresh to avoid it misfiring every minute.`);
        } else {
            schedule.scheduleJob('birthday-upcoming-refresh', birthdayUpcomingRefreshInterval, async () => {
                for (const guild of client.guilds.cache.values()) {
                    await refreshUpcomingMessage(guild).catch((error) => console.error(`❌ Periodic upcoming birthdays refresh failed for guild ${guild.id}:\n`, error));
                }
            });
            console.log(`✅ Upcoming birthdays periodic refresh scheduled (${birthdayUpcomingRefreshInterval}).`);
        }
    }
};
