const memberProfileSchema = require('../models/memberProfile');

async function checkTriviaStreak(guildId, memberId) {
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

    const storedStreak = parseInt(query.triviaStreak);

    if (storedStreak <= 0) {
        return;
    }

    return storedStreak;
};

module.exports = { checkTriviaStreak };