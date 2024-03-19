const memberProfileSchema = require('../models/memberProfile');

async function checkFruit(guildId, memberId) {
    if (guildId === null || guildId === undefined) {
        return;
    }

    if (memberId === null || memberId === undefined) {
        return;
    }

    const query = await memberProfileSchema.findOne({ guildId: guildId, memberId: memberId });

    if (!query) {
        return;
    }

    const storedAmount = parseInt(query.fruit);

    if (storedAmount <= 0) {
        return;
    }

    return storedAmount;
};

module.exports = { checkFruit };