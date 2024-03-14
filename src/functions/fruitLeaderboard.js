const memberProfileSchema = require('../models/memberProfile');

async function fruitLeaderboard(guildId) {
    if (guildId === null || guildId === undefined) {
        return;
    }

    const query = await memberProfileSchema.find({ guildId: guildId });

    if (!query) {
        return;
    }

    let standings = [];

    query.forEach(async (value) => {
        standings.push({
            memberId: value.memberId,
            fruit: value.fruit
        });
    });

    standings.sort((a, b) => b.fruit - a.fruit);
    const output = standings.slice(0, 10);

    let string = '';
    let num = 1;

    output.forEach(async (value) => {
        string += `**#${num}** <@${value.memberId}> - (${value.fruit})\n`;
        num ++;
    });

    string = string.replace('undefined', '');

    return string;
};

module.exports = { fruitLeaderboard };