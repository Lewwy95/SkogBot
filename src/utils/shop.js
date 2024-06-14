const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const shopSchema = require('../models/shop');
const accountSchema = require('../models/accounts');

// Buy an item from the shop
async function buyItem(interaction, itemData) {
    if (!interaction || !interaction.guild || !interaction.user) { // Check if the interaction object was provided and is fully valid
        console.error('Interaction object was not provided or is not fully valid.');
        return;
    }

    if (!itemData) { // Check if the item data was provided
        console.error('Item data object was not provided.');
        return;
    }

    var shopQuery = await shopSchema.findOne({ guildId: interaction.guild.id }); // Fetch existing database entries

    if (!shopQuery) { // Check if any shop entries exist
        await shopSchema.create({ guildId: interaction.guild.id }); // Create a default entry in the database if none exist
        shopQuery = await shopSchema.findOne({ guildId: interaction.guild.id }); // Reassign the query variable to the newly created entry
    }

    var cheapestItem = null; // Variable to store the cheapest available item
    var cheapestPrice = Infinity; // Variable to store the cheapest available item's price

    for (const value of shopQuery.items) { // Loop through all of the shop items and check for the item that the user wants to buy
        if (value.name === itemData.name && value.username !== interaction.user.displayName) { // Check if the item is the one the user wants to buy and if it is not being sold by the user
            if (value.price < cheapestPrice) { // Check if the item is cheaper than the previous item and then update the cheapest item and it's price
                cheapestItem = value;
                cheapestPrice = value.price;
            }
        }
    }

    if (cheapestItem) { // Check if a cheapest item was found
        const accountQuery = await accountSchema.findOne({ guildId: interaction.guild.id, userId: interaction.user.id }); // Fetch existing account for the user

        if (!accountQuery) { // Check if the user account exists
            interaction.reply({ content: 'You don\'t have an account. Appear online to create one.', ephemeral: true });
            return;
        }

        if (accountQuery.fruit < cheapestItem.price * itemData.quantity) { // Check if the user has enough fruit to buy the item
            const requiredFruit = cheapestItem.price * itemData.quantity - accountQuery.fruit; // Calculate the required amount of fruit the user needs
            interaction.reply({ content: `You don't have enough fruit to buy ${itemData.quantity} of item ${itemData.name}. You need ${requiredFruit} more fruit.`, ephemeral: true });
            return;
        }

        if (cheapestItem.quantity <= 0) { // Check if the item is in stock
            const nextCheapestItem = shopQuery.items && shopQuery.items.find(item => item.quantity > 0 && item.price > cheapestPrice); // Find the next cheapest item that is in stock

            if (nextCheapestItem) { // If the next cheapest item is found then update the cheapest item and it's price
                cheapestItem = nextCheapestItem;
                cheapestPrice = nextCheapestItem.price;
            } else {
                interaction.reply({ content: `${itemData.name} is out of stock.`, ephemeral: true });
                return; // Exit the function as there are no more items of this type that are available
            }
        }

        if (!cheapestItem.multiple && accountQuery.inventory.includes(cheapestItem.name)) { // Check if the item can only be bought once and if the user already has it
            interaction.reply({ content: `You already own a ${itemData.name}.`, ephemeral: true });
            return;
        }

        if (cheapestItem.username === interaction.user.displayName) { // Check if the item is being sold by the same user
            interaction.reply({ content: `You can't buy your own ${itemData.name}.`, ephemeral: true });
            return;
        }

        if (cheapestItem.quantity < itemData.quantity) { // Check if the quantity of the item the user wants to buy is greater than the available quantity in the shop
            interaction.reply({ content: `There are only ${cheapestItem.quantity} of ${itemData.name} available.`, ephemeral: true });
            return;
        }

        if (cheapestItem.username !== 'Shop') { // Check if the item is being sold by another user
            const seller = await interaction.guild.members.fetch({ query: cheapestItem.username, limit: 1 }); // Find the seller from the server's member list using their username

            if (!seller) { // Check if the seller exists
                interaction.reply({ content: `${itemData.name} is being sold by ${cheapestItem.username} but they aren't a member of the server.`, ephemeral: true });
                return;
            }

            const sellerId = seller.first().id; // Fetch the seller's user id
            const sellerQuery = await accountSchema.findOne({ guildId: interaction.guild.id, userId: sellerId }); // Fetch existing account for the user associated with the item

            if (!sellerQuery) { // Check if the seller account exists
                interaction.reply({ content: `${itemData.name} is being sold by ${cheapestItem.username} but they don\'t have an account.`, ephemeral: true });
                return;
            }

            const newBalance = sellerQuery.fruit + cheapestItem.price * itemData.quantity; // Calculate the new balance for the seller
            await accountSchema.findOneAndUpdate({ guildId: interaction.guild.id, userId: sellerId }, { fruit: newBalance }); // Update the seller's account with the new balance

            try { // Check if the seller can receive private messages
                const sellerUser = await interaction.client.users.fetch(sellerId); // Fetch the seller's user object
                sellerUser.send(`You have sold ${itemData.quantity} ${itemData.name} for ${cheapestItem.price * itemData.quantity} fruit.`); // Send a message to the seller letting them know that their item has been sold
            } catch {
                console.log(`User ${sellerQuery.username} sold ${itemData.quantity} of ${itemData.name} but is not DMable.`);
            }

            shopQuery.items = shopQuery.items.filter(item => item.name !== itemData.name || item.username === 'Shop'); // Remove seller items from the shop after they are sold
            await shopQuery.save(); // Save the updated shop data to the database
        }

        const newFruit = accountQuery.fruit - cheapestItem.price * itemData.quantity; // Calculate the new amount of fruit the user will have
        const inventory = accountQuery.inventory; // Fetch the user's inventory

        const existingItemIndex = inventory.findIndex(item => item.name === cheapestItem.name); // Find the index of the existing item in the inventory

        if (existingItemIndex !== -1) { // If the item already exists in the inventory
            inventory[existingItemIndex].quantity += itemData.quantity; // Increase the quantity of the existing item
        } else { // If the item does not exist in the inventory
            inventory.push({ name: cheapestItem.name, quantity: itemData.quantity, type: cheapestItem.type }); // Add the item with the quantity to the inventory
        }

        await accountSchema.findOneAndUpdate({ guildId: interaction.guild.id, userId: interaction.user.id }, { // Update the user's account to the database
            fruit: newFruit,
            inventory: inventory
        });

        cheapestItem.quantity -= itemData.quantity; // Decrease the item quantity
        await shopSchema.findOneAndUpdate({ guildId: interaction.guild.id }, { $set: { "items.$[elem].quantity": cheapestItem.quantity } }, { arrayFilters: [{ "elem.name": itemData.name, "elem.price": cheapestItem.price }] }); // Update the item quantity in the database

        interaction.reply({ content: `You have purchased ${itemData.quantity} ${itemData.name} for ${cheapestItem.price * itemData.quantity} fruit.`, ephemeral: true });

        return; // Exit the function as the user has successfully bought the item
    }

    interaction.reply({ content: `The shop doesn't sell "${itemData.name}". The name must be exact and is case sensitive.`, ephemeral: true }); // Send a message to the user if the item does not exist
    return;
};

// Sell an item to the shop
async function sellItem(interaction, itemData) {
    if (!interaction || !interaction.guild || !interaction.user) { // Check if the interaction object was provided and is fully valid
        console.error('Interaction object was not provided or is not fully valid.');
        return;
    }
    
    if (!itemData) { // Check if the item data was provided
        console.error('Item data object was not provided.');
        return;
    }
    
    var accountQuery = await accountSchema.findOne({ guildId: interaction.guild.id, userId: interaction.user.id }); // Fetch existing account for the user

    if (!accountQuery) { // Check if the user account exists
        interaction.reply({ content: 'You don\'t have an account. Appear online to create one.', ephemeral: true });
        return;
    }

    if (!accountQuery.inventory.find(item => item.name === itemData.name)) { // Check if the user owns the item
        interaction.reply({ content: `You don't own a ${itemData.name}.`, ephemeral: true });
        return;
    }

    if (accountQuery.inventory.filter(item => item.name === itemData.name).length < itemData.quantity) { // Check if the user has fewer items than the quantity they are trying to sell
        interaction.reply({ content: `You don't have ${itemData.quantity} of a ${itemData.name}.`, ephemeral: true });
        return;
    }

    var shopQuery = await shopSchema.findOne({ guildId: interaction.guild.id }); // Fetch existing shop data

    if (!shopQuery) { // Check if any shop entries exist
        await shopSchema.create({ guildId: interaction.guild.id }); // Create a default entry in the database if none exist
        shopQuery = await shopSchema.findOne({ guildId: interaction.guild.id }); // Reassign the shopQuery variable to the newly created entry
    }

    shopQuery.items.push({ name: itemData.name, price: itemData.price, quantity: itemData.quantity, allowMultiple: false, username: interaction.user.displayName, type: itemData.type }); // Add the item to the shop
    await shopQuery.save(); // Save the updated shop data to the database

    const inventory = accountQuery.inventory; // Fetch the user's inventory
    inventory.splice(accountQuery.inventory.indexOf(itemData.name), itemData.quantity); // Remove the item from the user's inventory
    await accountSchema.findOneAndUpdate({ guildId: interaction.guild.id, userId: interaction.user.id }, { inventory: inventory }); // Update the user's account to the database

    interaction.reply({ content: `You added ${itemData.quantity} ${itemData.name} to the shop for ${itemData.price} fruit.`, ephemeral: true });
    return;
};

// View shop items
async function viewItems(interaction) {
    if (!interaction || !interaction.guild) { // Check if the interaction object was provided and is fully valid
        console.error('Interaction object was not provided or is not fully valid.');
        return;
    }

    var shopQuery = await shopSchema.findOne({ guildId: interaction.guild.id }); // Fetch existing database entries

    if (!shopQuery) { // Check if any shop entries exist
        await shopSchema.create({ guildId: interaction.guild.id }); // Create a default entry in the database if none exist
        shopQuery = await shopSchema.findOne({ guildId: interaction.guild.id }); // Reassign the query variable to the newly created entry
    }

    var data = []; // Create an empty array to store the shop data

    for (const value of shopQuery.items) { // Loop through all of the shop items
        data.push({ itemName: value.name, itemPrice: value.price, itemQuantity: value.quantity, itemUsername: value.username, itemType: value.type }); // Add the data to the array
    }

    const embedFields = data.map(item => ({ // Create an array of embed fields for each item
        name: item.itemName,
        value: `Price: ${item.itemPrice}\nType: ${item.itemType}\nQuantity: ${item.itemQuantity <= 0 ? 'Out of Stock' : item.itemQuantity}\nSeller: ${item.itemUsername}`
    }));

    const attachment = new AttachmentBuilder('src/images/shop.png', { name: 'shop.png' }); // Get the shop image

    interaction.reply({ // Send the list to the user
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('🛒 Shop')
            .setDescription('Check out what\'s for sale today.')
            .setThumbnail(`attachment://${attachment.name}`)
            .addFields(embedFields)
        ],
        ephemeral: true,
        files: [attachment]
    });

    return;
};

module.exports = { buyItem, sellItem, viewItems }; // Export the functions so they can be used in other files