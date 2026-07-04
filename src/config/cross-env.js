const dotenv = require('dotenv');

// Configure multiple environment variables.
dotenv.config({
    path: `${process.cwd()}/.${process.env.NODE_ENV.replace(' ', '')}.env`
});

// Export from environment variables.
module.exports = {
    token: process.env.TOKEN,
    database: process.env.DATABASE,
    redisUrl: process.env.REDIS,
    birthdayCronTime: process.env.BIRTHDAY_CRON_TIME || '0 9 * * *',
    birthdayTimezone: process.env.BIRTHDAY_TIMEZONE || 'Europe/London',
    birthdayUpcomingRefreshInterval: process.env.BIRTHDAY_UPCOMING_REFRESH_INTERVAL || '*/30 * * * *'
};
