const { AttachmentBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const accountSchema = require('../models/accounts');

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

    if (!item.type) { // Check if the item type is valid
        interaction.reply({ content: `The type of ${item.name} is unknown and therefore it can't be used.`, ephemeral: true });
        return;
    }

    switch (item.type) { // Check the type of the item
        case 'Weapon': { // If the item is a weapon
            const attackMonsterButton = new ButtonBuilder() // Create a button to attack a daily monster
                .setCustomId('attackMonster')
                .setStyle(ButtonStyle.Primary) // Blue
                .setLabel('Attack Monster')

            const discardWeaponButton = new ButtonBuilder() // Create a button to discard the weapon
                .setCustomId('discardWeapon')
                .setStyle(ButtonStyle.Danger) // Red
                .setLabel('Discard (Permanent)')

            const buttonRow = new ActionRowBuilder() // Create a button row for the buttons
                .addComponents(attackMonsterButton, discardWeaponButton);

            const embed = new EmbedBuilder() // Create an embed for the shop
                .setColor('Purple')
                .setTitle('⚔️ Weapons')
                .setDescription('Choose how you would like to use your weapon.')

            const message = await interaction.reply({ // Send the weapon embed to the user
                embeds: [embed],
                components: [buttonRow],
                ephemeral: true
            });

            const collector = message.createMessageComponentCollector({ ComponentType: ComponentType.Button }); // Create a collector for the button

            collector.on('collect', async (interaction) => { // Listen for the button interaction
                await interaction.deferReply({ ephemeral: true }); // Defer the reply so we can simulate a loading state

                switch (interaction.customId) { // Check which button was clicked
                    case 'attackMonster': { // If the user wants to attack a daily monster
                        const accountQuery = await accountSchema.findOne({ guildId: interaction.guild.id, userId: interaction.user.id }); // Fetch existing account for the user

                        if (!accountQuery) { // Check if the user account exists
                            interaction.followUp({ content: 'You don\'t have an account. Appear online to create one.', ephemeral: true });
                            return;
                        }

                        const lastAttack = new Date(accountQuery.daily); // Fetch the last time the user attacked a monster
                        const currentTime = Date.now(); // Get the current timestamp
                        const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
                        
                        if (lastAttack && currentTime - lastAttack < oneDay) { // Check if the user has already attacked a monster within the last 24 hours
                            interaction.followUp({ content: 'You have recently attacked a monster. Please try again later.', ephemeral: true });
                            return;
                        }

                        accountQuery.daily = currentTime; // Update the last attack time to the current time
                        await accountQuery.save(); // Save the updated account with the new monster data

                        const success = Math.random() < 0.5; // 50% chance of success

                        if (success) { // If the attack is successful
                            embed.setDescription(`You swing your ${itemName} with all of its might and destroy the monster.\nYou are now completely exhausted.`); 
                        } else { // If the attack is unsuccessful
                            embed.setDescription(`You swing your ${itemName} but miss the monster.\nYou are now completely exhausted.`);
                        }

                        await message.edit({ embeds: [embed], components: [buttonRow] }); // Update the original message
                        break;
                    }

                    case 'discardWeapon': { // If the user wants to discard the weapon
                        const accountQuery = await accountSchema.findOne({ guildId: interaction.guild.id, userId: interaction.user.id }); // Fetch existing account for the user

                        if (!accountQuery) { // Check if the user account exists
                            interaction.followUp({ content: 'You don\'t have an account. Appear online to create one.', ephemeral: true });
                            return;
                        }

                        const inventory = accountQuery.inventory; // Fetch the user's inventory
                        const itemIndex = inventory.findIndex(item => item.name === itemName); // Find the index of the item in the inventory array

                        if (itemIndex === -1) { // If the item is not found in the inventory
                            interaction.followUp({ content: `You don\'t own a ${itemName}.`, ephemeral: true });
                            return;
                        }

                        inventory.splice(itemIndex, 1); // Remove the item from the inventory array
                        await accountQuery.save(); // Save the updated account with the removed item

                        embed.setDescription(`You throw your ${itemName} away and it shatters as it hits the ground.`); // Update the embed to show that the weapon was used

                        const buttons = buttonRow.components; // Get all the buttons in the button row
                        buttons.forEach(button => button.setDisabled(true)); // Disable all the buttons
                        await message.edit({ embeds: [embed], components: [buttonRow] }); // Update the original message with the disabled buttons
                        break;
                    }
                }

                interaction.deleteReply(); // Delete the user's next reply to simulate that the loading state has finished
            });

            break;
        }

        case 'Consumable': { // If the item is a consumable
            interaction.followUp({ content: `Your ${item.name} is a consumable.`, ephemeral: true });
            break;
        }

        case 'Token': { // If the item is a token
            interaction.followUp({ content: `Your ${item.name} is a token.`, ephemeral: true });
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
            .setDescription('Check what\'s in your inventory.')
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

module.exports = { useItem, viewItems }; // Export the functions so they can be used in other files