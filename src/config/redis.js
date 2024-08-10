const { Redis } = require('ioredis');
const { redisUrl } = require('./cross-env');

// Create an instance of Redis using the connection string from the .env file.
// This instance can be used to interact with the Redis database in other files.
const redis = new Redis(redisUrl);
module.exports = redis;