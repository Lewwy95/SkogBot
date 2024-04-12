const { trivia } = require('../../functions/trivia');

module.exports = {
    data: {
        name: 'spawn-trivia',
        description: 'Spawn an instance of daily trivia.',
    },
 
    run: ({ interaction, client }) => {
        trivia(client, 1);

        interaction.reply({
            content: 'I have spawned an instance of daily trivia.',
            ephemeral: true
        });
    },

    options: {
        userPermissions: ['Administrator']
    }
};