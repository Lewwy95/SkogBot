const profileSchema = require('../schemas/profiles');

async function giveFruit(guildId, userId, targetId, amount) {
    if (guildId === null || guildId === undefined) {
        console.log('giveFruit.js: GuildId object is null/undefined.');
        return;
    }

    if (targetId === null || targetId === undefined) {
        console.log('giveFruit.js: TargetId object is null/undefined.');
        return;
    }

    if (amount === null || amount === undefined) {
        console.log('giveFruit.js: Amount object is null/undefined.');
        return;
    }

    if (userId) {
        const query = await profileSchema.findOne({ guildId: guildId, userId: userId });

        if (!query) {
            console.log('giveFruit.js: No user profile found.');
            return;
        }
    }

    const targetQuery = await profileSchema.findOne({ guildId: guildId, userId: targetId });

    if (!targetQuery) {
        console.log('giveFruit.js: No user profile found.');
        return;
    }

    if (userId) {
        const userOldAmount = parseInt(query.fruit);
        const userNewAmount = userOldAmount - amount;

        await query.updateOne({ fruit: userNewAmount });
    }

    const targetOldAmount = parseInt(targetQuery.fruit);
    const targetNewAmount = targetOldAmount + amount;

    if (targetNewAmount > 0) {
        await targetQuery.updateOne({ fruit: targetNewAmount });
    }
};

module.exports = { giveFruit };