module.exports = {
    data: {
        name: 'simulate-join',
        description: 'Simulate yourself joining the guild for the first time.',
    },
 
    run: ({ interaction, client }) => {
        client.emit('guildMemberAdd', interaction.member);

        interaction.reply({
            content: 'I have simulated you joining the guild for the first time.',
            ephemeral: true
        });
    },

    options: {
        devOnly: true
    }
};