const dotenv = require('dotenv');

dotenv.config({ path: `${process.cwd()}/.${process.env.NODE_ENV.replace(' ', '')}.env` });

module.exports = {
    countCoins: parseInt(process.env.COUNTCOINS),
    countCooldown: parseInt(process.env.COUNTCOOLDOWN),
    countExtendedCooldownPrice: parseInt(process.env.COUNTEXTENDEDCOOLDOWNPRICE),
    countMultiplier: parseInt(process.env.COUNTMULTIPLIER),
    database: process.env.DATABASE,
    memberPoints: parseInt(process.env.MEMBERPOINTS),
    token: process.env.TOKEN
};