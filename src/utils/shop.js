const shopSchema = require('../models/shop');
const accountSchema = require('../models/accounts');

// Buy an item from the shop
async function buyItem(guildId, member, itemName) {
    if (!guildId) { // Check if the guild id was provided
        console.log('utils/shop.js: Guild id object was not provided.');
        return;
    }

    if (!member) { // Check if the member was provided
        console.log('utils/shop.js: Member object was not provided.');
        return;
    }

    if (!itemName) { // Check if the item name was provided
        console.log('utils/shop.js: Item name object was not provided.');
        return;
    }

    var query = await shopSchema.findOne({ guildId: guildId }); // Fetch existing database entries

    if (!query) { // Check if any shop entries exist
        await shopSchema.create({ // Create a default entry in the database if none exist
            guildId: guildId
        });

        query = await shopSchema.findOne({ guildId: guildId }); // Reassign the query variable to the newly created entry
    }

    for (const value of query.items) { // Loop through all of the shop items and check if the item exists
        if (value.name === itemName) {
            var query = await accountSchema.findOne({ guildId: guildId, userId: member.user.id }); // Fetch existing account for the user

            if (!query) { // Check if the user account exists
                console.log(`utils/shop.js: User account for <${member.user.displayName}> not found.`);
                return;
            }

            if (query.fruit < value.price) { // Check if the user has enough fruit to buy the item
                console.log(`utils/shop.js: User <${member.user.displayName}> does not have enough fruit to buy item <${itemName}>.`);
                return;
            }

            var newFruit = query.fruit - value.price; // Calculate the new amount of fruit the user will have
            var inventory = query.inventory; // Fetch the user's inventory

            inventory.push(value.name); // Add the item to the user's inventory

            await accountSchema.findOneAndUpdate({ guildId: guildId, userId: member.user.id }, { // Update the user's account to the database
                fruit: newFruit,
                inventory: inventory
            });

            console.log(`utils/shop.js: User <${member.user.displayName}> purchased item <${itemName}> successfully.`);
            break;
        } else {
            console.log(`utils/shop.js: Item <${itemName}> not found in the shop.`); // Log an error if the item does not exist
            return;
        }
    }
};

module.exports = buyItem; // Export the function so it can be used in other files