const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const schedule = require('node-schedule');
const redis = require('../config/redis');

const data = new SlashCommandBuilder()
    .setName('counting')
    .setDescription('Manage the counting game.')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('target')
            .setDescription('Set an active target for the counting game.')
            .addNumberOption((option) =>
                option
                    .setName('value')
                    .setDescription('The number that players must try to achieve.')
                    .setRequired(true)
            )
            .addNumberOption((option) =>
                option
                    .setName('expiry')
                    .setDescription('The day of the week that the target will expire (1 - Monday | 7 = Sunday).')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(7)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('blacklist')
            .setDescription('Toggle the counting game blacklist system.')
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('protections')
            .setDescription('Toggle the counting game protection system.')
    )

/**
 * 
 * @param { import('commandkit').SlashCommandProps } param0
 */
 
async function run({ interaction }) {
    // Here we get the subcommand that was used in the interaction.
    // We can then use this to determine what action to take next!
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
        case 'target': {
            // Get the target value and expiry day from the interaction options.
            const targetValue = interaction.options.getNumber('value');
            const targetDay = interaction.options.getNumber('expiry');

            // Check if there is a counting channel - if there isn't then we can stop here.
            const channel = interaction.client.channels.cache.find(channel => channel.name.includes('count'));
            if (!channel) {
                interaction.reply({ content: 'A counting channel does not exist.', ephemeral: true });
                return;
            }

            // Map numbers 1-7 to days of the week.
            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const expiryDayName = daysOfWeek[(targetDay - 1) % 7];

            // Create an embed with the counting data.
            const embed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setTitle('Counting Game')
                .setDescription(`The targeted number is **${targetValue}** which will expire on **${expiryDayName}** night!`);

            // Send the embed to the counting channel and pin the message.
            const sentMessage = await channel.send({ embeds: [embed] });
            await sentMessage.pin();

            // Send a reply to the user to confirm that the counting target was added.
            interaction.reply({ content: `Your counting game target of **${targetValue}** set to expire on **${expiryDayName}** night has been set for the <#${channel.id}> channel.`, ephemeral: true });

            // Delete any previous counting game data in Redis for this channel.
            await redis.del(`${channel.id}_countingchannel`);

            // Store the counting target in Redis with the channel ID as the key.
            await redis.set(`${channel.id}_countingchannel`, JSON.stringify({ currentValue: 1, targetValue: targetValue, lastUser: null, targetDay: targetDay, setBy: interaction.user.id, pinnedMessage: sentMessage.id, enableBlacklist: false, enableProtections: false }));

            // Schedule a notification to be sent 1 hour before the counting game resets.
            schedule.scheduleJob({ dayOfWeek: targetDay, hour: 22, minute: 0 }, async function() {
                // Create an embed to notify the channel that the counting game will reset soon.
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Counting Game')
                    .setDescription(`The game will expire in 1 hour!\nTry to reach the target before it resets.`);

                // Let the channel know that the counting game will reset soon.
                channel.send({ embeds: [embed] });
            });

            // Schedule the counting game time limit.
            schedule.scheduleJob({ dayOfWeek: targetDay, hour: 23, minute: 0 }, async function() {
                // Check if data exists in Redis for the counting game - if it doesn't then we can stop here.
                const query = await redis.get(`${channel.id}_countingchannel`);
                if (!query) {
                    console.log(`❌ Counting game not found in Redis for channel ${channel.id}!`);
                    return;
                }

                // Parse the data from Redis, store it to a variable.
                const data = await JSON.parse(query);
                if (!data) {
                    console.log(`❌ No counting game data found in Redis for channel ${channel.id}!`);
                    return;
                }

                // Calculate a new target day that is at least 2 days away from the current target day.
                let newTargetDay;
                do {
                    newTargetDay = Math.floor(Math.random() * 7) + 1; // 1-7 (Monday to Sunday)
                } while (Math.abs(newTargetDay - parseInt(data.targetDay)) < 2);

                // Map numbers 1-7 to days of the week.
                const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                const expiryDayName = daysOfWeek[(newTargetDay - 1) % 7];

                // Attempt to delete the latest pinned counting game message.
                try {
                    const pinnedMessage = await channel.messages.fetch(data.pinnedMessage);
                    pinnedMessage.delete();
                } catch (error) {
                    console.error('❌ Pinned counting game message missing:\n', error);
                }

                // Create an embed to notify the channel that the counting game has ended.
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Counting Game')
                    .setDescription(`Time is up! The count has been reset to **1** and the new expiry is **${expiryDayName}** night.\nThe targeted number is still **${targetValue}** and you can attempt to reach it again!\nPlease note that the blacklist has been reset so everyone can ruin again.`);

                // Let the channel know that the count was reset and pin the new message.
                const sentMessage = await channel.send({ embeds: [embed] });
                await sentMessage.pin();

                // Delete the blacklist for the counting game (if applicable).
                await redis.del(`${channel.id}_countingchannel_blacklist`);
                
                // Reset the counting game data in Redis.
                await redis.set(`${channel.id}_countingchannel`, JSON.stringify({ currentValue: 1, targetValue: data.targetValue, lastUser: null, targetDay: newTargetDay, setBy: data.setBy, pinnedMessage: sentMessage.id, enableBlacklist: data.enableBlacklist, enableProtections: data.enableProtections }));
            });
            break;
        }

        case 'blacklist': {
             // Check if there is a counting channel - if there isn't then we can stop here.
            const channel = interaction.client.channels.cache.find(channel => channel.name.includes('count'));
            if (!channel) {
                interaction.reply({ content: 'A counting channel does not exist.', ephemeral: true });
                return;
            }

            // Check if data exists in Redis for the counting game - if it doesn't then we can stop here.
            const query = await redis.get(`${channel.id}_countingchannel`);
            if (!query) {
                interaction.reply({ content: 'No counting game data exists in the database.', ephemeral: true });
                return;
            }

            // Parse the data from Redis, store it to a variable.
            const data = await JSON.parse(query);
            if (!data) {
                interaction.reply({ content: 'Counting game data could not be parsed.', ephemeral: true });
                return;
            }

            // Store the current blacklist toggle state.
            const blacklistToggle = data.enableBlacklist;

            // Update the counting game data in Redis with the new blacklist toggle state.
            await redis.set(`${channel.id}_countingchannel`, JSON.stringify({ currentValue: data.currentValue, targetValue: data.targetValue, lastUser: data.lastUser, targetDay: data.targetDay, setBy: data.setBy, pinnedMessage: data.pinnedMessage, enableBlacklist: !blacklistToggle, enableProtections: data.enableProtections }));

            // Send a reply to the user to confirm the state of the blacklist.
            interaction.reply({ content: `The counting game blacklist system has been ${blacklistToggle ? 'disabled' : 'enabled'}.`, ephemeral: true });
            break;
        }

        case 'protections': {
             // Check if there is a counting channel - if there isn't then we can stop here.
            const channel = interaction.client.channels.cache.find(channel => channel.name.includes('count'));
            if (!channel) {
                interaction.reply({ content: 'A counting channel does not exist.', ephemeral: true });
                return;
            }

            // Check if data exists in Redis for the counting game - if it doesn't then we can stop here.
            const query = await redis.get(`${channel.id}_countingchannel`);
            if (!query) {
                interaction.reply({ content: 'No counting game data exists in the database.', ephemeral: true });
                return;
            }

            // Parse the data from Redis, store it to a variable.
            const data = await JSON.parse(query);
            if (!data) {
                interaction.reply({ content: 'Counting game data could not be parsed.', ephemeral: true });
                return;
            }

            // Store the current protection toggle state.
            const protectionToggle = data.enableProtections;

            // Update the counting game data in Redis with the new protection system toggle state.
            await redis.set(`${channel.id}_countingchannel`, JSON.stringify({ currentValue: data.currentValue, targetValue: data.targetValue, lastUser: data.lastUser, targetDay: data.targetDay, setBy: data.setBy, pinnedMessage: data.pinnedMessage, enableBlacklist: data.enableBlacklist, enableProtections: !protectionToggle }));

            // Send a reply to the user to confirm the state of the protection system.
            interaction.reply({ content: `The counting game protection system has been ${protectionToggle ? 'disabled' : 'enabled'}.`, ephemeral: true });
            break;
        }
    }
};

module.exports = { data, run };
