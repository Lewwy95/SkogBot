const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
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

        if (itemData.quantity > 1 && !cheapestItem.allowMultiple) { // Check if the item can only be bought once and if the user is trying to buy more than one
            interaction.reply({ content: `You can't buy multiples of a ${itemData.name}.`, ephemeral: true });
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

        const existingItem = accountQuery.inventory.find(item => item.name === cheapestItem.name); // Find the existing item in the user's inventory
        if (!cheapestItem.allowMultiple && existingItem && existingItem.quantity >= itemData.quantity) { // Check if the item can only be bought once and if the user already has enough quantity
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
            inventory.push({ name: cheapestItem.name, quantity: itemData.quantity, allowMultiple: cheapestItem.allowMultiple, type: cheapestItem.type }); // Add the item with the quantity to the inventory
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
    
    const accountQuery = await accountSchema.findOne({ guildId: interaction.guild.id, userId: interaction.user.id }); // Fetch existing account for the user

    if (!accountQuery) { // Check if the user account exists
        interaction.reply({ content: 'You don\'t have an account. Appear online to create one.', ephemeral: true });
        return;
    }

    const inventory = accountQuery.inventory; // Fetch the user's inventory
    const item = inventory.find(item => item.name === itemData.name); // Find the item in the user's inventory

    if (!item) { // Check if the user owns the item
        interaction.reply({ content: `You don't own a ${itemData.name}.`, ephemeral: true });
        return;
    }

    const itemQuantity = inventory.filter(value => value.name === itemData.name).reduce((total, item) => total + item.quantity, 0); // Count the quantity of the item in the user's inventory

    if (itemQuantity < itemData.quantity) { // Check if the user has enough quantity of the item
        interaction.reply({ content: `You don't have ${itemData.quantity} of a ${itemData.name}.`, ephemeral: true });
        return;
    }

    const shopQuery = await shopSchema.findOne({ guildId: interaction.guild.id }) || await shopSchema.create({ guildId: interaction.guild.id }); // Fetch existing database entries or create a default entry if none exist
    const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Calculate the expiration date (24 hours from point of sale)
    shopQuery.items.push({ name: itemData.name, price: itemData.price, quantity: itemData.quantity, allowMultiple: item.allowMultiple, username: interaction.user.displayName, type: item.type, expiresAt: expirationDate }); // Add the item to the shop
    await shopQuery.save(); // Save the updated shop data to the database

    inventory.splice(accountQuery.inventory.indexOf(itemData.name), itemData.quantity); // Remove the item from the user's inventory
    await accountSchema.findOneAndUpdate({ guildId: interaction.guild.id, userId: interaction.user.id }, { inventory }); // Update the user's account to the database

    interaction.reply({ content: `You added ${itemData.quantity} ${itemData.name} to the shop for ${itemData.price} fruit.`, ephemeral: true }); // Send a message to the user letting them know that the item has been added to the shop
    return;
};

// View shop items
async function viewItems(interaction, itemsPerPage) {
    if (!interaction || !interaction.guild) { // Check if the interaction object was provided and is fully valid
        console.error('Interaction object was not provided or is not fully valid.');
        return;
    }

    if (!itemsPerPage) { // Check if the items per page was provided
        console.error('Items Per Page object was not provided or is not fully valid.');
        return;
    }

    const shopQuery = await shopSchema.findOne({ guildId: interaction.guild.id }) || await shopSchema.create({ guildId: interaction.guild.id }); // Fetch existing database entries or create a default entry if none exist
    const expiredItems = shopQuery.items.filter(item => item.expiresAt && item.expiresAt.getTime() <= Date.now()); // Filter out expired items
    
    if (expiredItems.length > 0) { // Check if there are any expired items
        for (const expiredItem of expiredItems) { // Loop through all of the expired items
            const seller = await interaction.guild.members.fetch({ query: expiredItem.username, limit: 1 }); // Find the seller from the server's member list using their username

            if (seller) { // Check if the seller exists
                const sellerId = seller.first().id; // Fetch the seller's user id
                const sellerQuery = await accountSchema.findOne({ guildId: interaction.guild.id, userId: sellerId }); // Fetch existing account for the user associated with the item

                if (sellerQuery) { // Check if the seller account exists
                    const inventory = sellerQuery.inventory; // Fetch the seller's inventory
                    inventory.push({ name: expiredItem.name, quantity: expiredItem.quantity, allowMultiple: expiredItem.allowMultiple, type: expiredItem.type }); // Add the expired item to the seller's inventory
                    await accountSchema.findOneAndUpdate({ guildId: interaction.guild.id, userId: sellerId }, { inventory: inventory }); // Update the seller's account in the database

                    try { // Check if the seller can receive private messages
                        const sellerUser = await interaction.client.users.fetch(sellerId); // Fetch the seller's user object
                        await sellerUser.send(`Your listing in the ${interaction.guild.name} shop has expired. All contents have been returned to you.\n- ${expiredItem.quantity}x ${expiredItem.name} - ${expiredItem.price * expiredItem.quantity} Fruit`); // Send a message to the seller letting them know that their item has expired
                    } catch {
                        console.log(`User ${sellerQuery.username} is not DMable.`);
                    }
                }
            }
        }

        shopQuery.items = shopQuery.items.filter(item => !expiredItems.includes(item)); // Remove expired items from the shop
        await shopQuery.save(); // Save the updated shop data to the database
    }

    const totalPages = Math.ceil(shopQuery.items.length / itemsPerPage); // Calculate the total number of pages
    let currentPage = 1; // Set the current page to 1
    let startIndex = (currentPage - 1) * itemsPerPage; // Calculate the start index
    let endIndex = startIndex + itemsPerPage; // Calculate the end index

    const embedFields = shopQuery.items.slice(startIndex, endIndex).map(item => ({ // Create an array of embed fields for the shop items
        name: item.name,
        value: `Fruit: ${item.price ? item.price : 'Free'}\nQuantity: ${item.quantity ? item.quantity : 'Out Of Stock'}\nSeller: ${item.username}\nExpires: ${item.expiresAt ? `<t:${Math.floor(item.expiresAt.getTime() / 1000)}:R>` : 'Never'}`
    }));

    const attachment = new AttachmentBuilder('src/images/shop.png', { name: 'shop.png' }); // Create an attachment for the shop image

    const showPreviousButton = new ButtonBuilder() // Create a button to show the previous page of items
        .setCustomId('showPrevious')
        .setStyle(ButtonStyle.Primary) // Blue
        .setLabel('Show Previous')
        .setDisabled(currentPage === 1);

    const showNextButton = new ButtonBuilder() // Create a button to show the next page of items
        .setCustomId('showNext')
        .setStyle(ButtonStyle.Primary) // Blue
        .setLabel('Show Next')
        .setDisabled(totalPages === currentPage);

    const buttonRow = new ActionRowBuilder() // Create a button row for the buttons
        .addComponents(showPreviousButton, showNextButton);

    const embed = new EmbedBuilder() // Create an embed for the shop
        .setColor('Purple')
        .setTitle('🛒 Shop')
        .setDescription('Check out what\'s for sale today.')
        .setThumbnail(`attachment://${attachment.name}`)
        .addFields(embedFields)
        .setFooter({ text: `Page ${currentPage}/${totalPages}` });

    const message = await interaction.reply({ // Create a message object to send to the user with the buttons
        embeds: [embed],
        files: [attachment],
        components: [buttonRow],
        ephemeral: true
    });

    const collector = message.createMessageComponentCollector({ ComponentType: ComponentType.Button }); // Create a collector for the buttons
    
    collector.on('collect', async (interaction) => { // Listen for the button interaction
        await interaction.deferReply({ ephemeral: true }); // Defer the reply so we can simulate a loading state

        if (interaction.customId === 'showNext') { // Check if the show next button was clicked
            currentPage++; // Increment the current page
        } else if (interaction.customId === 'showPrevious') { // Check if the show previous button was clicked
            currentPage--; // Decrement the current page
        }

        startIndex = (currentPage - 1) * itemsPerPage; // Calculate the new start index
        endIndex = startIndex + itemsPerPage; // Calculate the new end index

        const embedFields = shopQuery.items.slice(startIndex, endIndex).map(item => ({ // Create an array of embed fields for the shop items on the new page
            name: item.name,
            value: `Fruit: ${item.price}\nQuantity: ${item.quantity}\nSeller: ${item.username}\nExpires: ${item.expiresAt ? `<t:${Math.floor(item.expiresAt.getTime() / 1000)}:R>` : 'Never'}`
        }));

        embed.setFields(embedFields); // Update the original embed with the new fields
        embed.setFooter({ text: `Page ${currentPage}/${totalPages}` }); // Update the original embed with the new footer

        await message.edit({ embeds: [embed] }); // Update the original message with the updated embed

        if (currentPage >= totalPages) { // Check if the current page is the last page
            showNextButton.setDisabled(true); // Disable the show more button
        } else {
            showNextButton.setDisabled(false); // Enable the show more button
        }

        if (currentPage <= 1) { // Check if the current page is the first page
            showPreviousButton.setDisabled(true); // Disable the show previous button
        } else {
            showPreviousButton.setDisabled(false); // Enable the show previous button
        }

        await message.edit({ components: [buttonRow] }); // Update the original message
        await interaction.deleteReply(); // Delete the user's next reply to simulate that the loading state has finished
    });
};

// Restock items
async function restockItems(interaction) {
    if (!interaction || !interaction.guild) { // Check if the interaction object was provided and is fully valid
        console.error('Interaction object was not provided or is not fully valid.');
        return;
    }

    const minQuantity = 5; // Set the minimum quantity of items that can be restocked
    const maxQuantity = 15; // Set the maximum quantity of items that can be restocked
    const randomQuantity = Math.floor(Math.random() * (maxQuantity - minQuantity + 1)) + minQuantity; // Generate a random quantity of items to restock

    await shopSchema.findOneAndUpdate( // Update the shop's stock
        { guildId: interaction.guild.id },
        { $set: { 'items.$[item].quantity': randomQuantity } }, // Set the quantity of the items to the random quantity
        { arrayFilters: [{ 'item.username': 'Shop' }], new: true, upsert: true } // Replenish the stock of items that are being sold by the shop
    ) || await shopSchema.create({ guildId: interaction.guild.id }); // Create a default entry if none exist

    interaction.reply({ content: 'I have replenished the shop\'s stock.', ephemeral: true });
};

module.exports = { buyItem, sellItem, viewItems, restockItems }; // Export the functions so they can be used in other files