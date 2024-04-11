module.exports = {
    data: {
        name: 'flip-coin',
        description: 'The perfect way to decide on something.',
    },
 
    run: ({ interaction }) => {
        const result = ['Heads', 'Tails'];

        interaction.reply({
            content: `The coin has landed on **${result[Math.floor(Math.random() * result.length)]}**.`
        });
    }
};