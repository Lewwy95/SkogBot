const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { giveFruit } = require('../../functions/giveFruit');
const quoteSchema = require('../../schemas/quotes');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('You can add or view quotes that have been said by a user who is a member of this guild.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('If you\'ve heard something worth while then you can save it as a quote.')
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
                        .setDescription('The user that said the quote that you want to save.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('Fetch a list of quotes said by a user who is a member of this guild.')
                .addUserOption((option) =>
                    option
                        .setName('author')
                        .setDescription('The user who\'s quotes you\'d like to view.')
                        .setRequired(true)
                )
        ),
 
    run: async ({ interaction }) => {
        const channel = await interaction.client.channels.cache.find((channel) => channel.name.includes('quote'));

        if (!channel) {
            interaction.reply({
                content: 'The quote system has no channel.',
                ephemeral: true
            });

            console.log('quote.js: No channel with "quote" exists in guild.');
            return;
        }

        let query = await quoteSchema.findOne({ guildId: interaction.guild.id });

        if (!query) {
            await quoteSchema.create({
                guildId: interaction.guild.id,
                guildName: interaction.guild.name
            });

            query = await quoteSchema.findOne({ guildId: interaction.guild.id });

            console.log('quote.js: A quote object has been created in the database.');
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add': {
                const quote = interaction.options.getString('content');
                const author = interaction.options.getUser('author');

                if (quote.includes('"')) {
                    interaction.reply({
                        content: 'Please do not use quotation marks. These are added automatically for you when specifying the quote.',
                        ephemeral: true
                    });
                    return;
                }
            
                if (quote.includes('-')) {
                    interaction.reply({
                        content: 'Please do not use hyphens. These are added automatically for you when specifying the author.',
                        ephemeral: true
                    });
                    return;
                }

                query.quotes.push({ 
                    userId: author.id,
                    quoterId: interaction.user.id,
                    quote: quote
                });

                await query.save();

                channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('Purple')
                        .setAuthor({
                            name: author.displayName,
                            iconURL: author.displayAvatarURL({ dynamic: true })
                        })
                        .setTitle('😂 Add Quote')
                        .setDescription(`"${quote}"`)
                        .setThumbnail(author.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: `🏆 Submitted by ${interaction.user.displayName}` })
                    ]
                });

                giveFruit(interaction.guild.id, null, author.id, 5);
                giveFruit(interaction.guild.id, null, interaction.user.id, 5);

                interaction.reply({
                    content: `Your quote has been saved and can be viewed in the <#${channel.id}> channel.`,
                    ephemeral: true
                });
            }

            break;

            case 'view': {
                const author = interaction.options.getUser('author');
                let quoteString = '';

                query.quotes.forEach(async (value) => {
                    if (value.userId === author.id) {
                        quoteString += `- ${value.quote}\n`;
                    }
                });

                quoteString.slice(0, 850); // Avoid Crash

                if (quoteString.length === 0) {
                    quoteString = `There are no quotes by this user.`;
                }

                interaction.reply({
                    content: `Quotes by ${author.displayName}:\n\n${quoteString}`,
                    ephemeral: true
                });
            }

            break;
        }
    }
};