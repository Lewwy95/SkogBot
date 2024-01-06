const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType} = require('discord.js');
const { countExtendedCooldownPrice } = require('../../config');
const ms = require('ms');
const db = require('../../index');

module.exports = async (interaction) => {
    // Do nothing if the interaction is not a button
    if (!interaction.isButton()) return;

    // Handle if the instigator clicked the counting game cooldown button
    if (interaction.customId === 'countCooldown') {
        // Keep the member waiting while the interaction is processing
        await interaction.deferReply({ ephemeral: true });

        // Get the last member to reset the counting game from the database
        const result = await db.get(`${interaction.guild.id}_data.count.lastResetMemberId`);

        // Return an error to the instigator if no entry was found
        if (!result) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ The member that reset the counting game could not be found.')
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Fetch the member from cache
        const member = await interaction.guild.members.fetch(`${result}`).catch(console.error);

        // Return an error to the instigator if the member failed to pull from cache
        if (!member) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription(`❌ An error occurred when fetching a profile for <${result}>.`)
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Return an error to the instigator if they tried to put themselves on a cooldown
        if (interaction.user.id === member.id) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription(`❌ You can\'t try to put yourself on an extended cooldown.`)
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Get the coins amount from the database
        const data = await db.get(`${interaction.guild.id}_data.count.coins`);

        // Return an error to the instigator if no entry was found
        if (!data) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ The current coin amount is invalid or is equal to zero.')
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Return an error to the instigator if the balance is too low
        if (data < countExtendedCooldownPrice) {
            return await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription(`❌ This costs \`${countExtendedCooldownPrice}\` coins but the current balance is \`${data}\` coins.`)
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Delete the defer message
        await interaction.deleteReply();

        // Create a yes button
        const yesButton = new ButtonBuilder()
            .setLabel('I Agree')
            .setStyle(ButtonStyle.Success)
            .setCustomId('countCooldownYes')

        // Create a no button
        const noButton = new ButtonBuilder()
            .setLabel('I Disagree')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('countCooldownNo')

        // Bundle the buttons into a row
        const buttonRow = new ActionRowBuilder().addComponents(yesButton, noButton);

        // Send the vote to the counting game channel
        const message = await interaction.channel.send({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('🤔 Extended Cooldown Vote')
                .setDescription(`<@${interaction.user.id}> wants to put <@${member.id}> on an extended cooldown.`)
                .setThumbnail(member.displayAvatarURL({ dynamic: true }))
                .addFields({
                    name: 'Duration',
                    value: '\`1d\`',
                    inline: true
                }, {
                    name: 'Cost',
                    value: `\`${countExtendedCooldownPrice}\``,
                    inline: true
                }, {
                    name: 'Balance',
                    value: `\`${data}\``,
                    inline: true
                }, {
                    name: 'Rules',
                    value: 'Members can only vote once.',
                    inline: true
                }, {
                    name: 'Exemptions',
                    value: 'The vote creator and the target.',
                    inline: true
                }, {
                    name: 'Time',
                    value: 'This vote will end in \`5 minutes\`.',
                    inline: true
                })
            ],
            components: [buttonRow],
            allowedMentions: false
        });

        // Create a collector to collect the button clicks
        const collector = await message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: `${ms('5m')}`
        });

        // Create some variables to track the result
        const instigatorId = interaction.user.id;
        let yesClickedUserIds = [];
        let noClickedUserIds = [];
        let yesButtonResult = 0;
        let noButtonResult = 0;

        // Collect the button clicks
        collector.on('collect', async (interaction) => {
            // Return an error to the instigator or if they are the target and click a button
            if (interaction.user.id === instigatorId || interaction.user.id === member.id || yesClickedUserIds.includes(interaction.user.id) || noClickedUserIds.includes(interaction.user.id)) {
                return await interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Purple')
                        .setDescription('❌ You are not allowed to use this button.')
                    ],
                    ephemeral: true
                }).catch(console.error);
            }

            // Increment the button variable depending and add the instigator to the array
            if (interaction.customId === 'countCooldownYes') {
                // Push the instigator to the yes array and increment the result
                yesClickedUserIds.push(interaction.user.id);
                yesButtonResult++;
            }

            // Increment the button variable depending and add the instigator to the array
            if (interaction.customId === 'countCooldownNo') {
                // Push the instigator to the no array and increment the result
                noClickedUserIds.push(interaction.user.id);
                noButtonResult++;
            }

            // Send confirmation to the instigator
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('✅ Thank you for your vote. Check back soon to view the results.')
                ],
                ephemeral: true
            }).catch(console.error);
        });

        // Decide the fate of the target depending on the result
        collector.on('end', async () => {
            // Edit the original message to show disabled buttons
            await message.edit({ components: [] });

            // Apply an extended cooldown to the target if there were more yes votes than no votes
            if (yesButtonResult > noButtonResult) {
                // Deduct the amount of points from the counting game coins
                await db.sub(`${interaction.guild.id}_data.count.coins`, countExtendedCooldownPrice);

                // Add the member to an extended cooldown in the database
                await db.set(`${interaction.guild.id}_members.${member.user.username}.countCooldown`, Date.now());
                await db.set(`${interaction.guild.id}_members.${member.user.username}.countExtendedCooldown`, true);

                // Create a new embed
                const embed = new EmbedBuilder()
                embed.setColor('Purple')
                embed.setTitle('🥳 Extended Cooldown Applied')
                embed.setDescription(`<@${member.id}> has been put on an extended cooldown for \`1d\`.`)
                embed.setThumbnail(member.displayAvatarURL({ dynamic: true }))

                // Create string variables for the embed
                let yesString;
                let noString;

                // Add each member that voted yes to the embed string
                yesClickedUserIds.forEach(value => {
                    yesString += `<@${value}>\n`
                });

                // Add each member that voted yes to the embed string
                noClickedUserIds.forEach(value => {
                    noString += `<@${value}>\n`
                });

                // Modify the embed if the yes string variable is populated or not
                if (yesString) {
                    yesString = yesString.replace('undefined', '');
                    embed.addFields({
                        name: 'Members For',
                        value: `${yesString}`,
                        inline: true
                    })
                } else {
                    embed.addFields({
                        name: 'Members For',
                        value: 'Nobody',
                        inline: true
                    })
                }

                // Modify the embed if the no string variable is populated or not
                if (noString) {
                    noString = noString.replace('undefined', '');
                    embed.addFields({
                        name: 'Members Against',
                        value: `${noString}`,
                        inline: true
                    })
                } else {
                    embed.addFields({
                        name: 'Members Against',
                        value: 'Nobody',
                        inline: true
                    })
                }

                // Edit the original vote message
                await message.edit({ embeds: [embed] }).catch(console.error);
            }

            // Do not apply an extended cooldown to the target if there were more no votes than yes votes
            if (noButtonResult > yesButtonResult) {
                // Create a new embed
                const embed = new EmbedBuilder()
                embed.setColor('Purple')
                embed.setTitle('😡 Extended Cooldown Refused')
                embed.setDescription(`<@${member.id}> has **not** been put on an extended cooldown.`)
                embed.setThumbnail(member.displayAvatarURL({ dynamic: true }))

                // Create string variables for the embed
                let yesString;
                let noString;

                // Add each member that voted yes to the embed string
                yesClickedUserIds.forEach(value => {
                    yesString += `<@${value}>\n`
                });

                // Add each member that voted yes to the embed string
                noClickedUserIds.forEach(value => {
                    noString += `<@${value}>\n`
                });

                // Modify the embed if the yes string variable is populated or not
                if (yesString) {
                    yesString = yesString.replace('undefined', '');
                    embed.addFields({
                        name: 'Members For',
                        value: `${yesString}`
                    })
                } else {
                    embed.addFields({
                        name: 'Members For',
                        value: "Nobody"
                    })
                }

                // Modify the embed if the no string variable is populated or not
                if (noString) {
                    noString = noString.replace('undefined', '');
                    embed.addFields({
                        name: 'Members Against',
                        value: `${noString}`,
                        inline: true
                    })
                } else {
                    embed.addFields({
                        name: 'Members Against',
                        value: 'Nobody',
                        inline: true
                    })
                }

                // Edit the original vote message
                await message.edit({ embeds: [embed] }).catch(console.error);
            }

            // Do not apply an extended cooldown to the target if there was a tie
            if (yesButtonResult === noButtonResult) {
                // Create a new embed
                const embed = new EmbedBuilder()
                embed.setColor('Purple')
                embed.setTitle('😖 Extended Cooldown Tie')
                embed.setDescription(`<@${member.id}> has **not** been put on an extended cooldown.`)
                embed.setThumbnail(member.displayAvatarURL({ dynamic: true }))

                // Create string variables for the embed
                let yesString;
                let noString;

                // Add each member that voted yes to the embed string
                yesClickedUserIds.forEach(value => {
                    yesString += `<@${value}>\n`
                });

                // Add each member that voted yes to the embed string
                noClickedUserIds.forEach(value => {
                    noString += `<@${value}>\n`
                });

                // Modify the embed if the yes string variable is populated or not
                if (yesString) {
                    yesString = yesString.replace('undefined', '');
                    embed.addFields({
                        name: 'Members For',
                        value: `${yesString}`,
                        inline: true
                    })
                } else {
                    embed.addFields({
                        name: 'Members For',
                        value: 'Nobody',
                        inline: true
                    })
                }

                // Modify the embed if the no string variable is populated or not
                if (noString) {
                    noString = noString.replace('undefined', '');
                    embed.addFields({
                        name: 'Members Against',
                        value: `${noString}`,
                        inline: true
                    })
                } else {
                    embed.addFields({
                        name: 'Members Against',
                        value: 'Nobody',
                        inline: true
                    })
                }

                // Edit the original vote message
                await message.edit({ embeds: [embed] }).catch(console.error);
            }
        });
    }
};