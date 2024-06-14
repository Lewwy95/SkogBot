const data = {
    name: 'inventory',
    description: 'Manage your inventory.'
};

/**
 * 
 * @param { import('commandkit').SlashCommandProps } param0
 */
 
async function run({ interaction }) {
    const query = await accountSchema.findOne({ guildId: interaction.guild.id, userId: interaction.user.id }); // Fetch existing account for the user

    if (!query) { // Check if the user account exists
        interaction.reply({ content: 'You do not have an account.', ephemeral: true });
        return;
    }

    const inventory = await query.inventory.map(value => `Name: ${value.name}`).join('\n\n'); // Create a list of items to display to the user

    interaction.reply({ // Send the inventory to the user
        embeds: [new EmbedBuilder()
            .setColor('Pink')
            .setTitle('🎒 Inventory')
            .setDescription('Check out what\'s in your inventory.')
            //.setThumbnail(`attachment://${attachment.name}`)
            .addFields({
                name: 'Contents',
                value: inventory
            })
        ],
        ephemeral: true,
        //files: [attachment]
    });
};

module.exports = { data, run };