const shopSchema = require('../models/shop');
const accountSchema = require('../models/accounts');

// Buy an item from the shop
async function buyItem(interaction, itemName) {
    if (!interaction || !interaction.guild || !interaction.user) { // Check if the interaction object was provided and is fully valid
        console.error('Interaction object was not provided or is not fully valid.');
        return;
    }

    if (!itemName) { // Check if the item name was provided
        console.error('Item name object was not provided.');
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
        if (value.name === itemName) {
            if (value.price < cheapestPrice) { // Check if the item is cheaper than the previous item and then update the cheapest item and it's price
                cheapestItem = value;
                cheapestPrice = value.price;
            }
        }
    }

    if (cheapestItem) { // Check if a cheapest item was found
        const accountQuery = await accountSchema.findOne({ guildId: interaction.guild.id, userId: interaction.user.id }); // Fetch existing account for the user

        if (!accountQuery) { // Check if the user account exists
            interaction.reply({ content: 'You do not have an account.', ephemeral: true });
            return;
        }

        if (accountQuery.fruit < cheapestItem.price) { // Check if the user has enough fruit to buy the item
            const requiredFruit = cheapestItem.price - accountQuery.fruit; // Calculate the required amount of fruit the user needs
            interaction.reply({ content: `You do not have enough fruit to buy item ${itemName}. You need ${requiredFruit} more.`, ephemeral: true });
            return;
        }

        if (cheapestItem.quantity <= 0) { // Check if the item is in stock
            const nextCheapestItem = shopQuery.items && shopQuery.items.find(item => item.quantity > 0 && item.price > cheapestPrice); // Find the next cheapest item that is in stock

            if (nextCheapestItem) { // If the next cheapest item is found then update the cheapest item and it's price
                cheapestItem = nextCheapestItem;
                cheapestPrice = nextCheapestItem.price;
            } else {
                interaction.reply({ content: `Item ${itemName} is out of stock.`, ephemeral: true });
                return; // Exit the function as there are no more items of this type that are available
            }
        }

        if (!cheapestItem.multiple && accountQuery.inventory.includes(cheapestItem.name)) { // Check if the item can only be bought once and if the user already has it
            interaction.reply({ content: `You already own item ${itemName}.`, ephemeral: true });
            return;
        }

        if (cheapestItem.userName !== 'Shop Keeper') { // Check if the item is being sold by another user
            const seller = await interaction.guild.members.fetch({ query: cheapestItem.userName, limit: 1 }); // Find the seller from the server's member list using their username

            if (!seller) { // Check if the seller exists
                interaction.reply({ content: `Item ${itemName} is being sold by ${cheapestItem.userName} but they are not in the server.`, ephemeral: true });
                return;
            }

            const sellerId = seller.first().id; // Fetch the seller's user id
            const sellerQuery = await accountSchema.findOne({ guildId: interaction.guild.id, userId: sellerId }); // Fetch existing account for the user associated with the item

            if (!sellerQuery) { // Check if the seller account exists
                interaction.reply({ content: `Item ${itemName} is being sold by ${cheapestItem.userName} but they don\'t have an account.`, ephemeral: true });
                return;
            }

            const newBalance = sellerQuery.fruit + cheapestItem.price; // Calculate the new balance for the seller
            await accountSchema.findOneAndUpdate({ guildId: interaction.guild.id, userId: sellerId }, { fruit: newBalance }); // Update the seller's account with the new balance

            try { // Check if the seller can receive private messages
                const sellerUser = await interaction.client.users.fetch(sellerId); // Fetch the seller's user object
                sellerUser.send(`Your item ${itemName} has been sold for ${cheapestItem.price} fruit.`); // Send a message to the seller letting them know that their item has been sold
            } catch {
                console.log(`User ${sellerQuery.username} sold item ${itemName} but is not DMable.`);
            }
        }

        const newFruit = accountQuery.fruit - cheapestItem.price; // Calculate the new amount of fruit the user will have
        const inventory = accountQuery.inventory; // Fetch the user's inventory

        inventory.push(cheapestItem.name); // Add the item to the user's inventory

        await accountSchema.findOneAndUpdate({ guildId: interaction.guild.id, userId: interaction.user.id }, { // Update the user's account to the database
            fruit: newFruit,
            inventory: inventory
        });

        cheapestItem.quantity--; // Decrease the item quantity
        await shopSchema.findOneAndUpdate({ guildId: interaction.guild.id }, { $set: { "items.$[elem].quantity": cheapestItem.quantity } }, { arrayFilters: [{ "elem.name": itemName, "elem.price": cheapestItem.price }] }); // Update the item quantity in the database

        interaction.reply({ content: `You bought the first cheapest listing of item ${itemName} for ${cheapestItem.price} fruit.`, ephemeral: true });

        return; // Exit the function as the user has successfully bought the item
    }

    interaction.reply({ content: `The shop does not sell item ${itemName}.`, ephemeral: true }); // Send a message to the user if the item does not exist
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
        interaction.reply({ content: 'You do not have an account.', ephemeral: true });
        return;
    }

    if (!accountQuery.inventory.includes(itemData.name)) { // Check if the user owns the item
        interaction.reply({ content: `You do not own item ${itemData.name}.`, ephemeral: true });
        return;
    }

    if (accountQuery.inventory.filter(item => item === itemData.name).length < itemData.quantity) { // Check if the user has the amount of items they are trying to sell
        interaction.reply({ content: `You do not have amount ${itemData.quantity} of item ${itemData.name}.`, ephemeral: true });
        return;
    }

    var shopQuery = await shopSchema.findOne({ guildId: interaction.guild.id }); // Fetch existing shop data

    if (!shopQuery) { // Check if any shop entries exist
        await shopSchema.create({ guildId: interaction.guild.id }); // Create a default entry in the database if none exist
        shopQuery = await shopSchema.findOne({ guildId: interaction.guild.id }); // Reassign the shopQuery variable to the newly created entry
    }

    shopQuery.items.push({ name: itemData.name, price: itemData.price, quantity: itemData.quantity, allowMultiple: false, userName: interaction.user.username }); // Add the item to the shop
    await shopQuery.save(); // Save the updated shop data to the database

    const inventory = accountQuery.inventory; // Fetch the user's inventory
    inventory.splice(accountQuery.inventory.indexOf(itemData.name), itemData.quantity); // Remove the item from the user's inventory
    await accountSchema.findOneAndUpdate({ guildId: interaction.guild.id, userId: interaction.user.id }, { inventory: inventory }); // Update the user's account to the database

    interaction.reply({ content: `You added ${itemData.quantity} of item ${itemData.name} to the shop for ${itemData.price} fruit.`, ephemeral: true });
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

    for (const value of query.items) { // Loop through all of the shop items
        data.push({ itemName: value.name, itemPrice: value.price, itemQuantity: value.quantity, itemUserName: value.userName }); // Add the data to the array
    }

    return data; // Return the shop data
};

module.exports = { buyItem, sellItem, viewItems }; // Export the functions so they can be used in other files