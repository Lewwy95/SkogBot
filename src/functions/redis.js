const { Redis } = require('ioredis');
const dotenv = require('dotenv');

dotenv.config({ path: `${process.cwd()}/.${process.env.NODE_ENV.replace(' ', '')}.env` });

const redis = new Redis(process.env.REDIS);

module.exports = redis;