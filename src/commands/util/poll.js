const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const ms = require('ms');

const data = new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a timed poll that will aid you in the arts of decision making.')
    .addNumberOption((option) =>
        option
            .setName('duration')
            .setDescription('Select a duration that the poll will run for.')
            .setRequired(true)
            .addChoices({
                name: '1 Minute',
                value: 60000
            }, {
                name: '5 Minutes',
                value: 300000
            }, {
                name: '10 Minutes',
                value: 600000
            }, {
                name: '30 Minutes',
                value: 1800000
            })
    )
    .addStringOption((option) =>
        option
            .setName('question')
            .setDescription('Specify a question that members can vote on.')
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(204)
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    // Keep the member waiting while the command is processing
    await interaction.deferReply();

    // Get the parameters from the command
    const duration = interaction.options.getNumber('duration');
    const question = interaction.options.getString('question');

    // Create a yes button
    const yesButton = new ButtonBuilder()
        .setLabel('Yes')
        .setStyle(ButtonStyle.Success)
        .setCustomId('pollYes')

    // Create a no button
    const noButton = new ButtonBuilder()
        .setLabel('No')
        .setStyle(ButtonStyle.Danger)
        .setCustomId('pollNo')

    // Create an end button
    const endButton = new ButtonBuilder()
        .setLabel('End Poll')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('pollEnd')

    // Bundle the buttons into a row
    const buttonRow = new ActionRowBuilder().addComponents(yesButton, noButton, endButton);

    // Send the poll to the member's channel
    const message = await interaction.followUp({
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('👩‍⚖️ Poll')
            .setDescription(`<@${interaction.user.id}> has started a poll.`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields({
                name: 'Question',
                value: `${question}`
            }, {
                name: 'Rules',
                value: 'Voters are shown when the poll ends.',
                inline: true
            }, {
                name: 'Duration',
                value: `\`${ms(duration, { long: true })}\``,
                inline: true
            }, {
                name: 'Exemptions',
                value: `<@${interaction.user.id}>`,
                inline: true
            })
        ],
        components: [buttonRow],
        allowedMentions: false
    }).catch(console.error);

    // Create a collector to collect button clicks
    const collector = await message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: duration
    });

    // Create some variables to track the result
    const instigatorId = interaction.user.id;
    let yesClickedUserIds = [];
    let noClickedUserIds = [];
    let yesButtonResult = 0;
    let noButtonResult = 0;

    // Collect the button clicks
    collector.on('collect', async (interaction) => {
        // Return an error to the instigator if they click the yes or no button
        if (interaction.user.id === instigatorId && (interaction.customId === 'pollYes' || interaction.customId === 'pollNo')) {
            return await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ You are not allowed to vote on your own poll.')
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Return an error to the instigator if they click the end button but didn't create the poll
        if (interaction.customId === 'pollEnd' && interaction.user.id !== instigatorId) {
            return await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ You can\'t end a poll that you didn\'t create.')
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Return an error to the instigator if they click to vote a second time
        if ((interaction.customId === 'pollYes' || interaction.customId === 'pollNo') && (yesClickedUserIds.includes(interaction.user.id) || noClickedUserIds.includes(interaction.user.id))) {
            return await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('❌ You can only vote once on this poll.')
                ],
                ephemeral: true
            }).catch(console.error);
        }

        // Increment the button variable depending and add the instigator to the array
        if (interaction.customId === 'pollYes') {
            // Push the instigator to the yes array and increment the result
            yesClickedUserIds.push(interaction.user.id);
            yesButtonResult++;
        }

        // Increment the button variable depending and add the instigator to the array
        if (interaction.customId === 'pollNo') {
            // Push the instigator to the no array and increment the result
            noClickedUserIds.push(interaction.user.id);
            noButtonResult++;
        }

        // End the poll if the end button was clicked
        if (interaction.customId === 'pollEnd') {
            // Stop the collection of button clicks
            collector.stop();

             // Send confirmation to the instigator
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setDescription('✅ You have successfully ended your poll.')
                ],
                ephemeral: true
            }).catch(console.error);
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
        // Disable the buttons
        yesButton.setDisabled(true);
        noButton.setDisabled(true);
        endButton.setDisabled(true);

        // Edit the original message to show disabled buttons
        await message.edit({ components: [buttonRow] });

        // Fetch the poll creator from cache
        const member = await interaction.guild.members.fetch(`${instigatorId}`).catch(console.error);

        // Create a new embed
        const embed = new EmbedBuilder()
        embed.setColor('Purple')
        embed.setTitle('🥳 Poll Ended')
        embed.setDescription(`The poll created by <@${member.id}> has ended.`)
        embed.setThumbnail(member.displayAvatarURL({ dynamic: true }))
        embed.addFields({
            name: 'Question',
            value: `${question}`
        })

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
                name: 'Yes Voters',
                value: `${yesString}`,
                inline: true
            })
        } else {
            embed.addFields({
                name: 'Yes Voters',
                value: 'Nobody',
                inline: true
            })
        }

        // Modify the embed if the no string variable is populated or not
        if (noString) {
            noString = noString.replace('undefined', '');
            embed.addFields({
                name: 'No Voters',
                value: `${noString}`,
                inline: true
            })
        } else {
            embed.addFields({
                name: 'No Voters',
                value: 'Nobody',
                inline: true
            })
        }

        // Edit the original vote message
        await message.edit({ embeds: [embed] }).catch(console.error);
    });

    return;
};

/**
 * @type {import('commandkit').CommandOptions}
 */

const options = {
    dm_permission: false,
    userPermissions: ['SendMessages']
};

module.exports = {
    data,
    run,
    options
};