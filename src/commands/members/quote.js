const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const quoteSchema = require('../../models/quote');

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
    await interaction.deferReply({ ephemeral: true });

    const query = await quoteSchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        interaction.followUp('The quote system is currently offline. Please try again later.');
        return;
    }

    const channel = interaction.guild.channels.cache.find(channel => channel.id === query.channelId);

    if (!channel) {
        interaction.followUp('The quote system is currently offline. Please try again later.');
        return;
    }

    const quote = interaction.options.getString('content');
    const author = interaction.options.getUser('author');

    if (quote.includes('"')) {
        interaction.followUp('Please do not use quotation marks. These are added automatically for you when specifying the quote.');
        return;
    }

    if (quote.includes('-')) {
        interaction.followUp('Please do not use hyphens. These are added automatically for you when specifying the author.');
        return;
    }

    channel.send({
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setAuthor({
                name: `${author.displayName ? author.displayName : author.username}`,
                iconURL: author.displayAvatarURL({ dynamic: true })
            })
            .setTitle('Quote')
            .setDescription(`"${quote}"`)
            .setThumbnail(author.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `🏆 Submitted by ${interaction.user.displayName ? interaction.user.displayName : interaction.user.username}` })
        ],
        allowedMentions: { users: [] }
    });

    interaction.followUp(`Thank you for submitting this quote. You can view it in the <#${channel.id}> channel.`);
};

module.exports = { data, run };