const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const countingGameSchema = require('../../models/countingGame');
const memberCounterSchema = require('../../models/memberCounter');
const openAISchema = require('../../models/openAI');
const quoteSchema = require('../../models/quote');
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
                { name: 'Counting Game', value: 'Counting Game' },
                { name: 'Member Counter', value: 'Member Counter' },
                { name: 'Open-AI', value: 'Open-AI' },
                { name: 'Quote', value: 'Quote' },
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
        case 'Counting Game': {
            elementSchema = countingGameSchema;
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

        case 'Verify': {
            elementSchema = accessRequestSchema;
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
            channelId: channel.id
         });
    } else {
        await query.updateOne({
            guildId: interaction.guild.id,
            guildName: interaction.guild.name,
            channelName: channel.name,
            channelId: channel.id
        });
    }

    interaction.followUp(`You assigned the **${element}** element to the <#${channel.id}> channel.`);
};

module.exports = { data, run };