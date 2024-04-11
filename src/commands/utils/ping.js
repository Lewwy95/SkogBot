module.exports = {
    data: {
        name: 'ping',
        description: 'Useful to check if I\'m currently online.',
    },
 
    run: ({ interaction, client }) => {
        interaction.reply({
            content: `I am currently online with a ping of ${client.ws.ping}ms.`,
            ephemeral: true
        });
    }
};