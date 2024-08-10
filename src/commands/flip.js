const data = {
    name: 'flip',
    description: 'The perfect way to decide on something.'
};

/**
 * 
 * @param { import('commandkit').SlashCommandProps } param0
 */
 
function run({ interaction }) {
    const result = ['Heads', 'Tails'];
    interaction.reply({ content: `The coin has landed on **${result[Math.floor(Math.random() * result.length)]}**.` });
};

module.exports = { data, run };