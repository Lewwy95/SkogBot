const { SlashCommandBuilder } = require('discord.js');
const buyItem = require('../../utils/shop');

const data = new SlashCommandBuilder()
    .setName('shop-buy')
    .setDescription('Buy an item from the shop.')
    .addStringOption((option) =>
        option
            .setName('name')
            .setDescription('The name of the item.')
            .setRequired(true)
    );

/**
 * 
 * @param { import('commandkit').SlashCommandProps } param0
 */
 
async function run({ interaction }) {
    await interaction.deferReply({ ephemeral: true }); // Acknowledge the command then defer it so we can silently process the request later

    const itemName = interaction.options.getString('name');
    await buyItem(interaction.guild.id, interaction.member, itemName);

    interaction.deleteReply(); // Delete the original response
};

module.exports = { data, run };