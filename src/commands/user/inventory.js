const { SlashCommandBuilder } = require('discord.js');
const { useItem, viewItems } = require('../../utils/inventory');

const data = new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Manage your inventory.')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('use')
            .setDescription('Use an item from your inventory.')
            .addStringOption((option) =>
                option
                    .setName('name')
                    .setDescription('The name of the item that you would like to use.')
                    .setRequired(true)
                    .setMinLength(3)
                    .setMaxLength(240)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('view')
            .setDescription('View the contents of your inventory.')
    );

/**
 * 
 * @param { import('commandkit').SlashCommandProps } param0
 */
 
async function run({ interaction }) {
    const subcommand = interaction.options.getSubcommand(); // Fetch the subcommand from the user

    switch (subcommand) { // Check which subcommand was used
        case 'use': {
            const itemName = interaction.options.getString('name'); // Fetch the item name from the user's input 
            await useItem(interaction, itemName); // Buy the item using our imported function
            break;
        }

        case 'view': {
            await viewItems(interaction); // View the user's inventory using our imported function
            break;
        }
    }
};

module.exports = { data, run };