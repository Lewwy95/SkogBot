const ms = require('ms');
const countingGamesSchema = require('../../models/countingGames');
const memberProfilesSchema = require('../../models/memberProfiles');

module.exports = async (message) => {
    try {
        const countingQuery = await countingGamesSchema.findOne({ guildId: message.guild.id });

        if (!countingQuery) {
            return;
        }

        if (message.channel.id !== countingQuery.channelId) {
            return;
        }

        if (message.author.id === message.client.user.id) {
            return;
        }

        if (isNaN(message.content)) {
            return;
        }

        let memberQuery = await memberProfilesSchema.findOne({ guildId: message.guild.id, memberId: message.author.id });

        if (!memberQuery) {
            memberQuery = await memberProfilesSchema.create({
                guildId: message.guild.id,
                guildName: message.guild.name,
                memberUsername: message.author.username,
                memberId: message.author.id
            });
        }

        if (countingQuery.cooldown - (Date.now() - memberQuery.countingGameCooldown) > 0) {
            message.react('😇');

            const remaining = ms(countingQuery.cooldown - (Date.now() - memberQuery.countingGameCooldown), { long: true });

            message.channel.send({
                content: `<@${message.author.id}> is on a cooldown. They have **${remaining}** remaining.`,
                allowedMentions: { parse: [] }
            });

            return;
        } else {
            await memberQuery.updateOne({ countingGameCooldown: null });
        }

        if (message.author.username === countingQuery.lastMember) {
            message.react('✋');

            message.channel.send({
                content: `<@${message.author.id}> just submitted a number when it is not their turn.\n\nThe next correct number is **${countingQuery.nextNumber}**.`,
                allowedMentions: { parse: [] }
            });

            return;
        }

        if (Math.trunc(message.content) !== countingQuery.nextNumber) {
            await memberQuery.updateOne({ countingGameCooldown: Date.now() });

            const resetChance = Math.random();

            if (resetChance < 0.5) { // Reset game (50%)
                await countingQuery.updateOne({
                    nextNumber: 1,
                    lastMember: null
                });

                message.react('🪦');

                message.channel.send({
                    content: `<@${message.author.id}> just reset the game by entering an incorrect number.\n\nThey are now on a cooldown for **${ms(countingQuery.cooldown, { long: true })}**.`,
                    allowedMentions: { users: [] }
                });
            } else {
                message.react('😇');

                message.channel.send({
                    content: `<@${message.author.id}> just entered an incorrect number but the game continues.\n\nThey are now on a cooldown for **${ms(countingQuery.cooldown, { long: true })}**.`,
                    allowedMentions: { parse: [] }
                });
            }

            return;
        }

        await countingQuery.updateOne({ 
            nextNumber: Math.trunc(message.content) +1,
            lastMember: message.author.username
        });

        message.react('✅');
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};