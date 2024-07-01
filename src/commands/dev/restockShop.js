const { restockItems } = require('../../utils/shop');

const data = {
    name: 'restock-shop',
    description: 'Replenishes the shop\'s stock.',
};

/**
 * 
 * @param { import('commandkit').SlashCommandProps } param0
 */
 
async function run({ interaction }) {
    await restockItems(interaction); // Call the function to replenish the shop's stock
};

module.exports = { data, run };