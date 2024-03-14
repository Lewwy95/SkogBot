const memberProfileSchema = require('../models/memberProfile');

async function giveFruit(guildId, memberId, amount) {
    if (guildId === null || guildId === undefined) {
        return;
    }

    if (memberId === null || memberId === undefined) {
        return;
    }

    if (amount === null || amount === undefined || isNaN(amount) || amount <= 0) {
        return;
    }

    const query = await memberProfileSchema.findOne({ guildId: guildId, memberId: memberId });

    if (!query) {
        return;
    }

    const storedAmount = query.fruit;
    const newAmount = storedAmount + amount;

    await query.updateOne({ fruit: newAmount });
};

module.exports = { giveFruit };