const dotenv = require('dotenv');

dotenv.config({ path: `${process.cwd()}/.${process.env.NODE_ENV.replace(' ', '')}.env` });

module.exports = {
    database: process.env.DATABASE,
    token: process.env.TOKEN,
    openAIKey: process.env.OPENAIKEY
};