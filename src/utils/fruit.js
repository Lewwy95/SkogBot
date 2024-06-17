const accountSchema = require('../models/accounts');

// Get a user's fruit amount
async function getFruit(interaction) {
    if (!interaction || !interaction.guild || !interaction.user) { // Check if the interaction object was provided and is fully valid
        console.error('Interaction object was not provided or is not fully valid.');
        return;
    }
    
    var accountQuery = await accountSchema.findOne({ guildId: interaction.guild.id, userId: interaction.user.id }); // Fetch existing account for the user

    if (!accountQuery) { // Check if the user account exists
        interaction.reply({ content: 'You don\'t have an account. Appear online to create one.', ephemeral: true });
        return;
    }

    return accountQuery.fruit || 0; // Return the fruit amount
};

// Give a user some fruit
async function giveFruit(interaction, amount) {
    if (!interaction || !interaction.guild || !interaction.user) { // Check if the interaction object was provided and is fully valid
        console.error('Interaction object was not provided or is not fully valid.');
        return;
    }

    if (!amount) { // Check if the amount was provided
        console.error('Amount object was not provided.');
        return;
    }
    
    const currentAmount = await getFruit(interaction); // Get the user's current fruit
    const newAmount = currentAmount + amount; // Give the user some more fruit
    await accountSchema.findOneAndUpdate({ guildId: interaction.guild.id, userId: interaction.user.id }, { fruit: newAmount }); // Save the account with the updated fruit amount
};

module.exports = { getFruit, giveFruit }; // Export the functions so they can be used in other files