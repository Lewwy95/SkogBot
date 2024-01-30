const { ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');
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
                    lastMember: null,
                    successfulResets: data.successfulResets + 1
                });

                await memberProfilesSchema.updateOne({ 
                    ...memberQuery,
                    countingGameSuccessfulResets: memberData.countingGameSuccessfulResets + 1
                });

                message.react('🪦');

                const buttonGameStats = new ButtonKit()
                    .setLabel('Game Statistics')
                    .setEmoji('🏆')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('buttonGameStats');
 
                const buttonRow = new ActionRowBuilder().addComponents(buttonGameStats);

                const resetMessage = await message.channel.send({
                    content: `<@${message.author.id}> has reset the game by entering an incorrect number.\n\nThey are now on a cooldown for **${ms(data.cooldown, { long: true })}**.`,
                    components: [buttonRow],
                    allowedMentions: { users: [] }
                });

                buttonGameStats
                    .onClick(
                        (buttonInteraction) => {
                            buttonInteraction.reply({
                                content: `Highest Number Achieved (All Time):\n**${data.recordNumber}**\n\nTotal Contributions (All Time):\n**${data.contributions}**\n\nTotal Successful Resets (All Time):\n**${data.successfulResets + 1}**\n\nTotal Failed Resets (All Time):\n**${data.failedResets}**`,
                                ephemeral: true
                            });
                        },
                        { message: resetMessage, time: 900000, autoReset: true } // 15 Minutes
                    )
                    .onEnd(() => {
                        buttonGameStats.setDisabled(true);
                        resetMessage.edit({ components: [buttonRow] });
                    });
            } else {
                await countingGamesSchema.updateOne({
                    ...query,
                    failedResets: data.failedResets + 1
                });

                await memberProfilesSchema.updateOne({ 
                    ...memberQuery,
                    countingGameFailedResets: memberData.countingGameFailedResets + 1
                });

                message.react('😇');

                message.channel.send({
                    content: `<@${message.author.id}> just entered an incorrect number but the game continues.\n\nThey are now on a cooldown for **${ms(data.cooldown, { long: true })}**.`,
                    allowedMentions: { parse: [] }
                });
            }

            return;
        }

        let recordNumber = data.recordNumber;

        if (Math.trunc(message.content) > data.recordNumber) {
            recordNumber = Math.trunc(message.content);
        }

        await countingGamesSchema.updateOne({ 
            nextNumber: Math.trunc(message.content) + 1,
            recordNumber: recordNumber,
            contributions: data.contributions + 1,
            lastMember: message.author.username
        });

        await memberProfilesSchema.updateOne({ 
            ...memberQuery,
            countingGameContributions: memberData.countingGameContributions + 1
        });

        message.react('✅');
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};