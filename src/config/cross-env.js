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
    openAIKey: process.env.OPENAI
};