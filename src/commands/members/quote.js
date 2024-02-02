const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const quotesSchema = require('../../models/quotes');

const data = new SlashCommandBuilder()
    .setName('quote')
    .setDescription('If you\'ve heard something worth while then you can save it as a quote.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addStringOption((option) =>
        option
            .setName('content')
            .setDescription('The content of the quote that you want to save.')
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(240)
    )
    .addUserOption((option) =>
        option
            .setName('author')
            .setDescription('The member that said the quote that you want to save.')
            .setRequired(true)
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const query = { guildId: interaction.guild.id };

        const quoteExists = await quotesSchema.exists(query);

        if (!quoteExists) {
            interaction.followUp('The quote system is currently offline. Please try again later.');
            return;
        }

        const data = await quotesSchema.findOne({ ...query });

        const channel = interaction.guild.channels.cache.find(channel => channel.id === data.channelId);

        if (!channel) {
            interaction.followUp('The quote system is currently offline. Please try again later.');
            return;
        }

        const quote = interaction.options.getString('content');
        const author = interaction.options.getUser('author');

        if (quote.includes('"')) {
            interaction.followUp('Please do not use quotation marks. These are added automatically for you.');
            return;
        }

        channel.send({
            content: `<@${interaction.user.id}> just submitted a new quote:\n\n**"${quote}"** - *<@${author.id}>*`,
            allowedMentions: { parse: [] }
        });

        data.quotes.push({ 
            quote: quote,
            author: author.username
        });

        await data.save();

        interaction.followUp(`Thank you for submitting this quote. You can view it in the <#${channel.id}> channel.`);
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};

module.exports = { data, run };