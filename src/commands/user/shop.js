const { SlashCommandBuilder } = require('discord.js');
const { buyItem, viewItems } = require('../../utils/shop');

const data = new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Utilise the shop.')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('buy')
            .setDescription('Buy an item from the shop.')
            .addStringOption((option) =>
                option
                    .setName('name')
                    .setDescription('The name of the item you would like to buy.')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('view')
            .setDescription('View the items that are available in the shop.')
    );

/**
 * 
 * @param { import('commandkit').SlashCommandProps } param0
 */
 
async function run({ interaction }) {
    const subcommand = interaction.options.getSubcommand(); // Fetch the subcommand from the user

    switch (subcommand) { // Check which subcommand was used
        case 'buy': {
            const itemName = interaction.options.getString('name'); // Fetch the item name from the user's input
            await buyItem(interaction, itemName); // Buy the item using our imported function
            break;
        }

        case 'view': {
            const data = await viewItems(interaction); // View the shop items using our imported function

            if (!data) { // Check if there are any items in the shop
                interaction.reply({ content: 'There are no items in the shop.', ephemeral: true });
                return;
            }

            const itemsList = data.map(item => `Name: ${item.itemName}\nPrice: ${item.itemPrice}\nQuantity: ${item.itemQuantity === 0 ? 'Out of Stock' : item.itemQuantity}`).join('\n\n'); // Create a list of items to display to the user
            interaction.reply({ content: itemsList, ephemeral: true }); // Send the list to the user
            break;
        }
    }
};

module.exports = { data, run };