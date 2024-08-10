const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');
const quoteSchema = require('../models/quote-schema');

const data = new SlashCommandBuilder()
    .setName('quote')
    .setDescription('You can add or view quotes that have been said by a specific user.')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('If you\'ve heard something worth while then you can save it as a quote.')
            .addUserOption((option) =>
                option
                    .setName('user')
                    .setDescription('The user that said the quote that you want to save.')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('content')
                    .setDescription('The content of the quote that you want to save.')
                    .setRequired(true)
                    .setMinLength(3)
                    .setMaxLength(240)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('view')
            .setDescription('Fetch a list of quotes from the server or a specific user.')
            .addUserOption((option) =>
                option
                    .setName('user')
                    .setDescription('The user who\'s quotes you\'d like to view.')
            )
            .addNumberOption((option) =>
                option
                    .setName('per-page')
                    .setDescription('The number of quotes to display per page.')
                    .setMinValue(1)
                    .setMaxValue(10)
            )
    );

/**
 * 
 * @param { import('commandkit').SlashCommandProps } param0
 */
 
async function run({ interaction }) {
    // Here we get the subcommand that was used in the interaction.
    // We can then use this to determine what action to take next!
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
        case 'add': {
            // Get the quote data from the interaction options.
            const author = interaction.options.getUser('user');
            const content = interaction.options.getString('content');

            // Check if there is a quoteschannel - if there isn't then we can stop here.
            const channel = interaction.client.channels.cache.find(channel => channel.name.includes('quote'));
            if (!channel) {
                interaction.reply({ content: 'A quote channel does not exist.', ephemeral: true });
                return;
            }

            // Check the database for an existing quote schema - if one doesn't exist then create a new one.
            // After that, we add the new quote to the database!
            const query = await quoteSchema.findOne({ guildId: interaction.guild.id }) || await quoteSchema.create({ guildId: interaction.guild.id });
            query.quotes.push({ userId: author.id, quoterId: interaction.user.id, quote: content });
            await query.save();

            // Create an embed with the quote data.
            const embed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setTitle('Quote Board')
                .setDescription(`A new quote from ${author.displayName} just dropped!`)
                .setThumbnail(author.displayAvatarURL({ dynamic: true }))
                .addFields({ name: 'Content', value: `- ${content}` })
                .setFooter({ text: `⭐ Submitted by ${interaction.user.displayName}` })
                .setTimestamp();

            // Finally, we try to send the embed to the quotes channel!
            channel.send({ embeds: [embed] }).then(() => {
                console.log(`✅ Quote added by ${interaction.user.displayName} sent successfully.`);
            }).catch((error) => {
                console.error(`❌ Quote added by ${interaction.user.displayName} failed to send:\n`, error);
            });

            // Send a reply to the user to confirm that the quote was added.
            interaction.reply({ content: `Your quote has been submitted and can be viewed in the <#${channel.id}> channel.`, ephemeral: true });
            break;
        }

        case 'view': {
            // Get the quote data from the interaction options.
            const author = interaction.options.getUser('user') || 'All';
            const perPage = interaction.options.getNumber('per-page') || 3;

            // Check the database for an existing quote schema - if one doesn't exist then create a new one.
            // After that, we try to fetch the quotes from the database and stop if there are none to display!
            const query = await quoteSchema.findOne({ guildId: interaction.guild.id }) || await quoteSchema.create({ guildId: interaction.guild.id });
            if (!query || query.quotes.length <= 0) {
                interaction.reply({ content: 'There are no quotes to display.', ephemeral: true });
                return;
            }

            // Filter the quotes based on the author.
            // If the author is set to 'All' then we display all quotes - if no quotes are found then we stop!
            const filteredQuotes = author === 'All' ? query.quotes : query.quotes.filter(quote => quote.userId === author.id);
            if (filteredQuotes.length === 0) {
                interaction.reply({ content: `No quotes by ${author.displayName} were found.`, ephemeral: true });
                return;
            }

            // Calculate the total number of pages based on the number of quotes and the number of quotes per page.
            // We then set the current page to 1 and calculate the start and end index for the quotes to display.
            const totalPages = Math.ceil(filteredQuotes.length / perPage);
            let currentPage = 1;
            let startIndex = (currentPage - 1) * perPage;
            let endIndex = startIndex + perPage;

            // Create an embed with the quote data.
            const embedFields = filteredQuotes.slice(startIndex, endIndex).map(quote => ({
                name: quote.userId,
                value: `- ${quote.quote}`
            }));

            // Here we loop through the quotes and add them to the embed fields.
            for (const field of embedFields) {
                const saidBy = interaction.guild.members.cache.get(field.name);
                field.name = `${saidBy ? saidBy.displayName : 'Unknown'}`;
            }

            // Create the buttons for the user to navigate through the pages.
            const previousPage = new ButtonKit()
                .setEmoji('⬅️')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('previousPage')
                .setDisabled(currentPage === 1);
            
            const nextPage = new ButtonKit()
                .setEmoji('➡️')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('nextPage')
                .setDisabled(totalPages === currentPage);

            // Create a button row with the next and previous page buttons.
            const buttonRow = new ActionRowBuilder().addComponents(previousPage, nextPage);

            // Create an embed with the quote data and buttons.
            const attachment = new AttachmentBuilder('src/images/quotes.png', { name: 'quotes.png' });
            const embed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setTitle('Quote Board')
                .setDescription(`Below are a list of quotes from ${author === 'All' ? 'all users' : author.displayName}.`)
                .setThumbnail(`attachment://${attachment.name}`)
                .addFields(embedFields)
                .setFooter({ text: `Page ${currentPage}/${totalPages}` });

            // Send the embed to the user as a reply!
            const message = await interaction.reply({
                embeds: [embed],
                components: [buttonRow],
                files: [attachment],
                fetchReply: true,
                ephemeral: true
            });

            // Here we listen for the button interactions from the user.
            // If the user clicks the next page button then we increment the current page and update the embed.
            previousPage.onClick(
                async (buttonInteraction) => {
                    // Here we defer the reply to prevent the interaction from timing out.
                    await buttonInteraction.deferReply({ ephemeral: true });

                    // Increment the current page and calculate the start and end index for the quotes to display.
                    currentPage--;
                    startIndex = (currentPage - 1) * perPage;
                    endIndex = startIndex + perPage;

                    // Update the embed fields with the new quotes based on the current page.
                    const embedFields = filteredQuotes.slice(startIndex, endIndex).map(quote => ({
                        name: quote.userId,
                        value: `- ${quote.quote}`
                    }));
                
                    // Here we loop through the quotes and add them to the embed fields.
                    for (const field of embedFields) {
                        const saidBy = buttonInteraction.guild.members.cache.get(field.name);
                        field.name = `${saidBy ? saidBy.displayName : 'Unknown'}`;
                    }

                    // Update the embed with the new fields and footer.
                    embed.setFields(embedFields);
                    embed.setFooter({ text: `Page ${currentPage}/${totalPages}` });

                    // Disable the appropriate buttons based on the current page.
                    // If the current page is the last page then we disable the next page button.
                    // If the current page is the first page then we disable the previous page button.
                    if (currentPage >= totalPages) {
                        nextPage.setDisabled(true);
                    } else {
                        nextPage.setDisabled(false);
                    }
                    if (currentPage <= 1) {
                        previousPage.setDisabled(true);
                    } else {
                        previousPage.setDisabled(false);
                    }

                    // Finally, we update the message with the new embed and buttons!
                    await interaction.editReply({ embeds: [embed], components: [buttonRow] });

                    // Delete the user's interaction to prevent spam.
                    buttonInteraction.deleteReply();
                },
                { message }
            );

            // Here we listen for the button interactions from the user.
            // If the user clicks the next page button then we increment the current page and update the embed.
            nextPage.onClick(
                async (buttonInteraction) => {
                    // Here we defer the reply to prevent the interaction from timing out.
                    await buttonInteraction.deferReply({ ephemeral: true });

                    // Increment the current page and calculate the start and end index for the quotes to display.
                    currentPage++;
                    startIndex = (currentPage - 1) * perPage;
                    endIndex = startIndex + perPage;

                    // Update the embed fields with the new quotes based on the current page.
                    const embedFields = filteredQuotes.slice(startIndex, endIndex).map(quote => ({
                        name: quote.userId,
                        value: `- ${quote.quote}`
                    }));
                
                    // Here we loop through the quotes and add them to the embed fields.
                    for (const field of embedFields) {
                        const saidBy = buttonInteraction.guild.members.cache.get(field.name);
                        field.name = `${saidBy ? saidBy.displayName : 'Unknown'}`;
                    }

                    // Update the embed with the new fields and footer.
                    embed.setFields(embedFields);
                    embed.setFooter({ text: `Page ${currentPage}/${totalPages}` });

                    // Disable the appropriate buttons based on the current page.
                    // If the current page is the last page then we disable the next page button.
                    // If the current page is the first page then we disable the previous page button.
                    if (currentPage >= totalPages) {
                        nextPage.setDisabled(true);
                    } else {
                        nextPage.setDisabled(false);
                    }
                    if (currentPage <= 1) {
                        previousPage.setDisabled(true);
                    } else {
                        previousPage.setDisabled(false);
                    }

                    // Finally, we update the message with the new embed and buttons!
                    await interaction.editReply({ embeds: [embed], components: [buttonRow] });

                    // Delete the user's interaction to prevent spam.
                    buttonInteraction.deleteReply();
                },
                { message }
            );
            break;
        }
    }
};

module.exports = { data, run };