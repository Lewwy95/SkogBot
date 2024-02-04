const ms = require('ms');
const countingGamesSchema = require('../../models/countingGames');
const memberProfilesSchema = require('../../models/memberProfiles');

module.exports = async (message) => {
    try {
        const query = { guildId: message.guild.id };

        const gameExists = await countingGamesSchema.exists(query);

        if (!gameExists) {
            return;
        }

        const data = await countingGamesSchema.findOne({ ...query });

        if (message.channel.id !== data.channelId) {
            return;
        }

        if (message.author.id === message.client.user.id) {
            return;
        }

        if (isNaN(message.content)) {
            return;
        }

        const memberQuery = {
            guildId: message.guild.id,
            memberId: message.author.id
        };

        const memberExists = await memberProfilesSchema.exists(memberQuery);

        if (!memberExists) {
            await memberProfilesSchema.create({
                ...memberQuery,
                guildName: message.guild.name,
                memberUsername: message.author.username
            });
        }

        const memberData = await memberProfilesSchema.findOne({ ...memberQuery });

        if (data.cooldown - (Date.now() - memberData.countingGameCooldown) > 0) {
            message.react('😇');

            const remaining = ms(data.cooldown - (Date.now() - memberData.countingGameCooldown), { long: true });

            message.channel.send({
                content: `<@${message.author.id}> is on a cooldown. They have **${remaining}** remaining.`,
                allowedMentions: { parse: [] }
            });

            return;
        } else {
            await memberProfilesSchema.updateOne({ 
                ...memberQuery,
                countingGameCooldown: null
            });
        }

        if (message.author.username === data.lastMember) {
            message.react('✋');

            message.channel.send({
                content: `<@${message.author.id}> just submitted a number when it is not their turn.\n\nThe next correct number is **${data.nextNumber}**.`,
                allowedMentions: { parse: [] }
            });

            return;
        }

        if (Math.trunc(message.content) !== data.nextNumber) {
            await memberProfilesSchema.updateOne({ 
                ...memberQuery,
                countingGameCooldown: Date.now()
            });

            const resetChance = Math.random();

            if (resetChance < 0.5) { // Reset game (50%)
                await countingGamesSchema.updateOne({
                    ...query,
                    nextNumber: 1,
                    lastMember: null
                });

                message.react('🪦');

                message.channel.send({
                    content: `<@${message.author.id}> just reset the game by entering an incorrect number.\n\nThey are now on a cooldown for **${ms(data.cooldown, { long: true })}**.`,
                    allowedMentions: { users: [] }
                });
            } else {
                message.react('😇');

                message.channel.send({
                    content: `<@${message.author.id}> just entered an incorrect number but the game continues.\n\nThey are now on a cooldown for **${ms(data.cooldown, { long: true })}**.`,
                    allowedMentions: { parse: [] }
                });
            }

            return;
        }

        await countingGamesSchema.updateOne({ 
            nextNumber: Math.trunc(message.content) +1,
            lastMember: message.author.username
        });

        message.react('✅');
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};