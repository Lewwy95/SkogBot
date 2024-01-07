const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
let { countCooldown, countMultiplier, countCoins } = require('../../config');
const ms = require('ms');
const db = require('../../index');

module.exports = async (message) => {
    // Get the counting game configuration from the database
    const result = await db.get(`${message.guild.id}_configs.count`);

    // If valid counting game configuration was found and the message was sent by a member
    if (result && !message.author.bot) {
        // If the message was sent in the counting game channel
        if (message.channel.id === result.channelId) {
            // Get the counting game data from the database
            let data = await db.get(`${message.guild.id}_data.count`);

            // Create some blank counting game data if none were found
            if (!data) {
                await db.set(`${message.guild.id}_data.count.nextNumber`, 1);
                await db.set(`${message.guild.id}_data.count.record`, 0);
                await db.set(`${message.guild.id}_data.count.coins`, 0);
                await db.set(`${message.guild.id}_data.count.lastContributeMember`, null);
                await db.set(`${message.guild.id}_data.count.lastResetMemberId`, null);

                // Fetch the data again
                data = await db.get(`${message.guild.id}_data.count`);
            }

            // Check for member data in the database
            const memberData = await db.get(`${message.guild.id}_members.${message.author.username}`);

            // Create some blank counting game member data if none were found
            if (!memberData) {
                await db.set(`${message.guild.id}_members.${message.author.username}.countContributions`, 0);
                await db.set(`${message.guild.id}_members.${message.author.username}.countSuccessfulResets`, 0);
                await db.set(`${message.guild.id}_members.${message.author.username}.countFailedResets`, 0);
            }

            // If the message sent was a number
            if (!isNaN(message.content)) {
                // Return an error to the member if counting game properties are not defined
                if (!countCoins || !countCooldown || !countMultiplier) {
                    return await message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor('Purple')
                            .setDescription('❌ The counting game configuration is invalid.')
                        ]
                    }).catch(console.error);
                }

                // Handle if the same member entered a number again
                if (data.lastContributeMember === message.author.username) {
                    // React to the message with an emoji
                    await message.react('⛔').catch(console.error);

                    // Add to the member's statistics in the database
                    await db.add(`${message.guild.id}_members.${message.author.username}.countFailedResets`, 1);

                    // Return a message to the counting game channel
                    return await message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor('Purple')
                            .setTitle('👼 Game Saved')
                            .setDescription(`<@${message.author.id}> must wait until another member types a number.`)
                            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                            .addFields({
                                name: 'Next Number',
                                value: `\`${data.nextNumber}\``
                            })
                        ],
                        allowedMentions: false
                    }).catch(console.error);
                }

                // Create a variable to store the new number that was entered
                let newNumber = Number(message.content);

                // Attempt to reset the game if the number entered is not equal to the number stored in the database
                if (newNumber !== data.nextNumber) {
                    // Fetch potential cooldowns from the database
                    const result = await db.fetch(`${message.guild.id}_members.${message.author.username}.countCooldown`);
                    const extendedCooldown = await db.fetch(`${message.guild.id}_members.${message.author.username}.countExtendedCooldown`);

                    // Set the cooldown duration to one day if the member is on an extended cooldown
                    if (extendedCooldown) {
                        countCooldown = 86400000;
                    }

                    // If the member is still on cooldown
                    if (countCooldown - (Date.now() - result) > 0) {
                        // React to the message with an emoji
                        await message.react('⛔').catch(console.error);

                        // Add to the member's statistics in the database
                        await db.add(`${message.guild.id}_members.${message.author.username}.countFailedResets`, 1);

                        // Format the duration so it is readable
                        const remaining = ms(countCooldown - (Date.now() - result), {
                            long: true
                        });

                        // Return a message to the member
                        return await message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor('Purple')
                                .setTitle('👼 Game Saved')
                                .setDescription(`<@${message.author.id}> typed the wrong number while on cooldown.`)
                                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                                .addFields({
                                    name: 'Time Remaining',
                                    value: `\`${remaining}\``
                                })
                            ],
                            allowedMentions: false
                        }).catch(console.error);
                    } else {
                        // Remove any potential cooldowns from the member
                        await db.delete(`${message.guild.id}_members.${message.author.username}.countCooldown`);
                        await db.delete(`${message.guild.id}_members.${message.author.username}.countExtendedCooldown`);
                    }

                    // Create a variable to store the chance of actually resetting the game
                    const ruinChance = Math.random();

                    // If the reset was successful
                    if (ruinChance < 0.5) {
                        // React to the message with an emoji
                        await message.react('😱').catch(console.error);

                        // Reset the number in the database
                        await db.set(`${message.guild.id}_data.count.nextNumber`, 1);

                        // Reset the last member in the database
                        await db.set(`${message.guild.id}_data.count.lastContributeMember`, null);

                        // Add the resetting member to the database
                        await db.set(`${message.guild.id}_data.count.lastResetMemberId`, `${message.author.id}`);

                        // Add to the resetting member's statistics in the database
                        await db.add(`${message.guild.id}_members.${message.author.username}.countSuccessfulResets`, 1);

                        // Add the member to a cooldown in the database
                        await db.set(`${message.guild.id}_members.${message.author.username}.countCooldown`, Date.now());

                        // Create a statistics button
                        const statsButton = new ButtonBuilder()
                            .setLabel('View Member Stats')
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId('countMemberStats')

                        // Create a cooldown button
                        const cooldownButton = new ButtonBuilder()
                            .setLabel('Apply Extended Cooldown')
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId('countCooldown')

                        // Bundle the buttons into a row
                        const buttonRow = new ActionRowBuilder().addComponents(statsButton, cooldownButton);

                        /*
                        // THE BUTTONS ARE HANDLED IN:
                        // "./src/events/interactionCreate/"
                        */

                        // Send a message to the channel explaining what happened
                        const msg = await message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor('Purple')
                                .setTitle('🥲 Game Over')
                                .setDescription(`The counting game has reset.`)
                                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                                .addFields({
                                    name: 'Ended By',
                                    value: `<@${message.author.id}>`,
                                    inline: true
                                }, {
                                    name: 'Cooldown Applied',
                                    value: `\`${ms(countCooldown, { long: true })}\``,
                                    inline: true
                                }, {
                                    name: ' ',
                                    value: ' '
                                }, {
                                    name: 'Number Reached',
                                    value: `\`${data.nextNumber - 1}\``,
                                    inline: true
                                }, {
                                    name: 'Highest Recorded',
                                    value: `\`${data.record}\``,
                                    inline: true
                                })
                            ],
                            components: [buttonRow],
                            allowedMentions: false
                        }).catch(console.error);

                        // Hacky way to disable the apply cooldown button once clicked
                        const collector = await msg.createMessageComponentCollector({ componentType: ComponentType.Button });

                        // Listen for button clicks on the cooldown button
                        collector.on('collect', async (interaction) => {
                            // Disable the button if clicked
                            if (interaction.customId === 'countCooldown') {
                                cooldownButton.setDisabled(true);

                                // Edit the original message to show disabled buttons
                                await msg.edit({
                                    components: [buttonRow]
                                });
                            }
                        });

                        // Set a timer to remove the cooldown
                        return setTimeout(async () => {
                            // Disable the buttons
                            statsButton.setDisabled(true);
                            cooldownButton.setDisabled(true);

                            // Edit the original message to show disabled buttons
                            await msg.edit({ components: [buttonRow] });
                        }, ms('30m'));
                    } else {
                        // React to the message with an emoji
                        await message.react('⛔').catch(console.error);

                        // Add to the member's statistics in the database
                        await db.add(`${message.guild.id}_members.${message.author.username}.countFailedResets`, 1);

                        // Add the member to a cooldown in the database
                        await db.set(`${message.guild.id}_members.${message.author.username}.countCooldown`, Date.now());

                        // Send a message to the channel explaining what happened
                        return await message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor('Purple')
                                .setTitle('👼 Game Saved')
                                .setDescription(`I have prevented <@${message.author.id}> from resetting the game.`)
                                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                                .addFields({
                                    name: 'Cooldown Applied',
                                    value: `\`${ms(countCooldown, { long: true })}\``
                                })
                            ],
                            allowedMentions: false
                        }).catch(console.error);
                    }
                }

                // React with a check if the number that was entered is correct
                await message.react('✅').catch(console.error);

                // Add to the member's statistics in the database
                await db.add(`${message.guild.id}_members.${message.author.username}.countContributions`, 1);

                // Update the old record with the new one if it has been broken
                if (newNumber > data.record) await db.set(`${message.guild.id}_data.count.record`, newNumber);

                // Increment the number to type in next
                newNumber++;

                // Calculate the new coins amount
                const coins = countCoins * countMultiplier;

                // Update the counting game coin amount in the database
                await db.add(`${message.guild.id}_data.count.coins`, coins);

                // Update the counting game in the database with the new information
                await db.set(`${message.guild.id}_data.count.nextNumber`, newNumber);
                return await db.set(`${message.guild.id}_data.count.lastContributeMember`, `${message.author.username}`);
            }
        }
    }
};