const data = {
    name: 'flip-coin',
    description: 'The perfect way to decide on something.'
};

/**
 * 
 * @param { import('commandkit').SlashCommandProps } param0
 */
 
function run({ interaction }) {
    const result = ['Heads', 'Tails'];
    interaction.reply({ content: `The coin has landed on **${result[Math.floor(Math.random() * result.length)]}**.` }); // Pick "Heads" or "Tails" with 50% chance
};

module.exports = { data, run };