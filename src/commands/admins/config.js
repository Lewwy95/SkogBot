const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');
const { fruitLeaderboard } = require('../../functions/fruitLeaderboard');
const birthdaySchema = require('../../models/birthday');
const countingGameSchema = require('../../models/countingGame');
const dailyFactSchema = require('../../models/dailyFact');
const dailyTriviaSchema = require('../../models/dailyTrivia');
const eventSchema = require('../../models/event');
const fruitLeaderboardSchema = require('../../models/fruitLeaderboard');
const memberCounterSchema = require('../../models/memberCounter');
const openAISchema = require('../../models/openAI');
const quoteSchema = require('../../models/quote');
const suggestionSchema = require('../../models/suggestion');
const ticketSchema = require('../../models/ticket');
const verifySchema = require('../../models/verify');
const voiceCreatorSchema = require('../../models/voiceCreator');

const data = new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure an element of this guild.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
        option
            .setName('element')
            .setDescription('Select an element of this guild to modify.')
            .setRequired(true)
            .addChoices(
                { name: 'Birthday', value: 'Birthday' },
                { name: 'Counting Game', value: 'Counting Game' },
                { name: 'Daily Fact', value: 'Daily Fact' },
                { name: 'Daily Trivia', value: 'Daily Trivia' },
                { name: 'Event', value: 'Event' },
                { name: 'Fruit Leaderboard', value: 'Fruit Leaderboard' },
                { name: 'Member Counter', value: 'Member Counter' },
                { name: 'Open-AI', value: 'Open-AI' },
                { name: 'Quote', value: 'Quote' },
                { name: 'Suggestion', value: 'Suggestion' },
                { name: 'Ticket', value: 'Ticket' },
                { name: 'Verify', value: 'Verify' },
                { name: 'Voice Creator', value: 'Voice Creator' }
            )
    )
    .addChannelOption((option) =>
        option
            .setName('channel')
            .setDescription('Select a channel to associate this element with.')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    await interaction.deferReply({ ephemeral: true });

    const element = interaction.options.getString('element');
    const channel = interaction.options.getChannel('channel');

    let elementSchema;

    switch (element) {
        case 'Birthday': {
            elementSchema = birthdaySchema;

            const buttonBirthdaySet = new ButtonKit()
                .setLabel('Set Birthday')
                .setEmoji('📅')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('buttonBirthdaySet');

            const buttonRow = new ActionRowBuilder().addComponents(buttonBirthdaySet);

            await channel.send({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('Birthday Handler')
                    .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        {
                            name: 'Info',
                            value: 'Setting your birthday will notify members at the appropriate time.',
                            inline: true
                        },
                        {
                            name: 'Removal',
                            value: 'Please submit a ticket if you\'d like your birthday to be removed.',
                            inline: true
                        }
                    )
                ],
                components: [buttonRow]
            });
        }

        break;

        case 'Counting Game': {
            elementSchema = countingGameSchema;
        }

        break;

        case 'Daily Fact': {
            elementSchema = dailyFactSchema;
        }

        break;

        case 'Daily Trivia': {
            elementSchema = dailyTriviaSchema;
        }

        break;

        case 'Event': {
            elementSchema = eventSchema;

            const buttonEvent = new ButtonKit()
                .setLabel('Request to Host Event')
                .setEmoji('🥳')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('buttonEvent');

            const buttonRow = new ActionRowBuilder().addComponents(buttonEvent);

            await channel.send({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('Event Handler')
                    .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        {
                            name: 'Info',
                            value: 'Please describe your event in as much detail as possible including any permissions you need.',
                            inline: true
                        },
                        {
                            name: 'Approval',
                            value: 'Hosting an event will require approval by a Moderator before it can begin.',
                            inline: true
                        }
                    )
                ],
                components: [buttonRow]
            });
        }

        break;

        case 'Fruit Leaderboard': {
            elementSchema = fruitLeaderboardSchema;

            const leaderboard = await fruitLeaderboard(interaction.guild.id);

            const buttonFruitLeaderboardRefresh = new ButtonKit()
                .setLabel('Refresh')
                .setEmoji('🔃')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('buttonFruitLeaderboardRefresh');

            const buttonRow = new ActionRowBuilder().addComponents(buttonFruitLeaderboardRefresh);

            await channel.send({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('Fruit Leaderboard - Top 10')
                    .setDescription('Who possesses the most fruit?')
                    .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                    .addFields({
                        name: 'Standings',
                        value: leaderboard,
                    })
                ],
                components: [buttonRow],
                allowedMentions: { users: [] }
            });
        }

        break;

        case 'Member Counter': {
            elementSchema = memberCounterSchema;
        }

        break;

        case 'Open-AI': {
            elementSchema = openAISchema;
        }

        break;

        case 'Quote': {
            elementSchema = quoteSchema;
        }

        break;

        case 'Suggestion': {
            elementSchema = suggestionSchema;

            const buttonSuggestion = new ButtonKit()
                .setLabel('Add Suggestion')
                .setEmoji('🤚')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('buttonSuggestion');

            const buttonRow = new ActionRowBuilder().addComponents(buttonSuggestion);

            await channel.send({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('Suggestion Handler')
                    .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        {
                            name: 'Info',
                            value: 'Adding a suggestion will allow other members to vote on it for an extended period of time.',
                            inline: true
                        },
                        {
                            name: 'Votes',
                            value: 'A suggestion\'s vote will expire when **24 hours** have passed since the last vote was cast.',
                            inline: true
                        }
                    )
                ],
                components: [buttonRow]
            });
        }

        break;

        case 'Ticket': {
            elementSchema = ticketSchema;

            const buttonTicket = new ButtonKit()
                .setLabel('Create Ticket')
                .setEmoji('🤚')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('buttonTicket');

            const buttonRow = new ActionRowBuilder().addComponents(buttonTicket);

            await channel.send({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('Ticket Handler')
                    .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        {
                            name: 'Info',
                            value: 'Creating a ticket is for server related issues only.',
                            inline: true
                        },
                        {
                            name: 'Moderator',
                            value: 'A Moderator will be available to assist you with your ticket.',
                            inline: true
                        }
                    )
                ],
                components: [buttonRow]
            });
        }

        break;

        case 'Verify': {
            elementSchema = verifySchema;

            const buttonVerifyRequest = new ButtonKit()
                .setLabel('Request Verification')
                .setEmoji('🤚')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('buttonVerifyRequest');

            const buttonRow = new ActionRowBuilder().addComponents(buttonVerifyRequest);

            await channel.send({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('Verification Handler')
                    .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        {
                            name: 'Info',
                            value: 'You must request verification before gaining access to the server.',
                            inline: true
                        },
                        {
                            name: 'Moderator',
                            value: 'A Moderator will be available to assist you with your request.',
                            inline: true
                        }
                    )
                ],
                components: [buttonRow]
            });
        }

        break;

        case 'Voice Creator': {
            elementSchema = voiceCreatorSchema;
        }

        break;
    }

    const query = await elementSchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        await elementSchema.create({
            guildId: interaction.guild.id,
            guildName: interaction.guild.name,
            channelName: channel.name,
            channelId: channel.id,
            parentId: channel.parent?.id ? channel.parent.id : 'None'
         });
    } else {
        await query.updateOne({
            guildId: interaction.guild.id,
            guildName: interaction.guild.name,
            channelName: channel.name,
            channelId: channel.id,
            parentId: channel.parent?.id ? channel.parent?.id : 'None'
        });
    }

    interaction.followUp(`You assigned the **${element}** element to the <#${channel.id}> channel.`);
};

module.exports = { data, run };