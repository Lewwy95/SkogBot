const dotenv = require('dotenv');

dotenv.config({ path: `${process.cwd()}/.${process.env.NODE_ENV.replace(' ', '')}.env` }); // Set up for cross environment variables

module.exports = { // Export all of the env processes so we can use them in other files
    database: process.env.DATABASE,
    redis: process.env.REDIS,
    token: process.env.TOKEN,
};