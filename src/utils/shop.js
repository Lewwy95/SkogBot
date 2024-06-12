const shopSchema = require('../models/shop');
const accountSchema = require('../models/accounts');

// Buy an item from the shop
async function buyItem(interaction, itemName) {
    if (!interaction) { // Check if the interaction object was provided
        console.error('Interaction object was not provided.');
        return;
    }

    if (!itemName) { // Check if the item name was provided
        console.error('Item name object was not provided.');
        return;
    }

    var query = await shopSchema.findOne({ guildId: interaction.guild.id }); // Fetch existing database entries

    if (!query) { // Check if any shop entries exist
        await shopSchema.create({ guildId: interaction.guild.id }); // Create a default entry in the database if none exist
        query = await shopSchema.findOne({ guildId: interaction.guild.id }); // Reassign the query variable to the newly created entry
    }

    for (const value of query.items) { // Loop through all of the shop items and check if the item exists
        if (value.name === itemName) {
            var query = await accountSchema.findOne({ guildId: interaction.guild.id, userId: interaction.user.id }); // Fetch existing account for the user

            if (!query) { // Check if the user account exists
                interaction.reply({ content: 'You do not have an account.', ephemeral: true });
                return;
            }

            if (query.fruit < value.price) { // Check if the user has enough fruit to buy the item
                interaction.reply({ content: 'You do not have enough fruit.', ephemeral: true });
                return;
            }

            if (value.quantity <= 0) { // Check if the item is in stock
                interaction.reply({ content: 'That item is out of stock.', ephemeral: true });
                return;
            }

            if (!value.multiple && query.inventory.includes(value.name)) { // Check if the item can only be bought once and if the user already has it
                interaction.reply({ content: 'You already own this item.', ephemeral: true });
                return;
            }

            var newFruit = query.fruit - value.price; // Calculate the new amount of fruit the user will have
            var inventory = query.inventory; // Fetch the user's inventory

            inventory.push(value.name); // Add the item to the user's inventory

            await accountSchema.findOneAndUpdate({ guildId: interaction.guild.id, userId: interaction.user.id }, { // Update the user's account to the database
                fruit: newFruit,
                inventory: inventory
            });

            value.quantity--; // Decrease the item quantity
            await shopSchema.findOneAndUpdate({ guildId: interaction.guild.id }, { $set: { "items.$[elem].quantity": value.quantity } }, { arrayFilters: [{ "elem.name": itemName }] }); // Update the item quantity in the database

            interaction.reply({ content: `You bought item ${itemName} for ${value.price} fruit.`, ephemeral: true });

            return; // Exit the function as the user has successfully bought the item
        }
    }

    interaction.reply({ content: 'The shop does not sell that item.', ephemeral: true }); // Send a message to the user if the item does not exist
    return;
};

// View shop items
async function viewItems(interaction) {
    if (!interaction) { // Check if the interaction object was provided
        console.error('Interaction object was not provided.');
        return;
    }

    var query = await shopSchema.findOne({ guildId: interaction.guild.id }); // Fetch existing database entries

    if (!query) { // Check if any shop entries exist
        await shopSchema.create({ guildId: interaction.guild.id }); // Create a default entry in the database if none exist
        query = await shopSchema.findOne({ guildId: interaction.guild.id }); // Reassign the query variable to the newly created entry
    }

    var data = []; // Create an empty array to store the shop data

    for (const value of query.items) { // Loop through all of the shop items
        data.push({ itemName: value.name, itemPrice: value.price, itemQuantity: value.quantity }); // Add to the array
    }

    return data; // Return the shop data
};

module.exports = { buyItem, viewItems }; // Export the functions so they can be used in other files