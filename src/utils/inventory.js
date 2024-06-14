const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const accountSchema = require('../models/accounts');

// Check the type of an item
async function getItemType(itemName) {
    if (!itemName) { // Check if the item name was provided
        console.error('Item name object was not provided.');
        return;
    }

    switch (itemName) { // Check the type of the item
        case 'Sword': return 'weapon';
        default: return 'unknown';
    }
};

// Use an item based on its type
async function useItem(interaction, itemName) {
    if (!interaction || !interaction.guild || !interaction.user) { // Check if the interaction object was provided and is fully valid
        console.error('Interaction object was not provided or is not fully valid.');
        return;
    }

    if (!itemName) { // Check if the item name was provided
        console.error('Item name object was not provided.');
        return;
    }
    
    var query = await accountSchema.findOne({ guildId: interaction.guild.id, userId: interaction.user.id }); // Fetch existing account for the user

    if (!query) { // Check if the user account exists
        interaction.reply({ content: 'You don\'t have an account. Appear online to create one.', ephemeral: true });
        return;
    }

    const inventory = query.inventory; // Fetch the user's inventory
    const item = await inventory.find(item => item.name === itemName); // Check if the user has the item

    if (!item) { // If the user doesn't have the item
        interaction.reply({ content: `You don\'t have a ${itemName}.`, ephemeral: true });
        return;
    }

    const itemType = await getItemType(item.name); // Fetch the type of the item

    if (itemType === 'unknown') { // Check if the item type is valid
        interaction.reply({ content: `The type of ${item.name} is unknown and therefore it can't be used.`, ephemeral: true });
        return;
    }

    switch (itemType) { // Check the type of the item
        case 'weapon': {
            interaction.reply({ content: `Your ${item.name} is a weapon so it goes swoosh and it kills you.`, ephemeral: true });
            break;
        }
    }
};

// View the inventory contents
async function viewItems(interaction) {
    if (!interaction || !interaction.guild || !interaction.user) { // Check if the interaction object was provided and is fully valid
        console.error('Interaction object was not provided or is not fully valid.');
        return;
    }
    
    const query = await accountSchema.findOne({ guildId: interaction.guild.id, userId: interaction.user.id }); // Fetch existing account for the user

    if (!query) { // Check if the user account exists
        interaction.reply({ content: 'You don\'t have an account. Appear online to create one.', ephemeral: true });
        return;
    }

    if (!query.inventory || query.inventory.length === 0) { // Check if the user has any items in their inventory
        interaction.reply({ content: 'You don\'t have any items in your inventory.', ephemeral: true });
        return;
    }

    const inventory = query.inventory.map(value => `- ${value.name} (${value.quantity})`).join('\n'); // Create a list of items to display to the user
    const attachment = new AttachmentBuilder('src/images/inventory.png', { name: 'inventory.png' }); // Get the inventory image

    interaction.reply({ // Send the inventory to the user
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('🧺 Inventory')
            .setDescription('Check out what\'s in your inventory.')
            .setThumbnail(`attachment://${attachment.name}`)
            .addFields({
                name: 'Contents',
                value: inventory
            })
        ],
        ephemeral: true,
        files: [attachment]
    });
};

module.exports = { getItemType, useItem, viewItems }; // Export the functions so they can be used in other files