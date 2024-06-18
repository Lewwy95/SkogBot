const mindReader = require('../../utils/mindreader/mindReader');

const data = {
    name: 'spawn-mindreader',
    description: 'Spawn an instance of the Mind Reader game.'
};

/**
 * 
 * @param { import('commandkit').SlashCommandProps } param0
 */
 
async function run({ interaction, client }) {
    await mindReader(client); // Call the function to spawn an instance of Mind Reader
    interaction.reply({ content: `I sent an instance of Mind Reader to <#${interaction.channel.id}>.`, ephemeral: true }); // Reply to the user
};

module.exports = { data, run };