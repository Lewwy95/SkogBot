const memberProfileSchema = require('../models/memberProfile');

async function takeFruit(guildId, memberId, amount) {
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

    const storedAmount = parseInt(query.fruit);

    if (storedAmount <= 0) {
        return;
    }

    const newAmount = storedAmount - parseInt(amount);

    await query.updateOne({ fruit: newAmount });
};

module.exports = { takeFruit };