const data = {
    name: 'ping',
    description: 'Useful to check if I\'m currently online.'
};

/**
 * 
 * @param { import('commandkit').SlashCommandProps } param0
 */
 
function run({ interaction, client }) {
    interaction.reply({ content: `I am currently online with a ping of ${client.ws.ping}ms.`, ephemeral: true });
};

module.exports = { data, run };