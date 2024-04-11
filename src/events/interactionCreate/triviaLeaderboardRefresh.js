const { triviaLeaderboard } = require('../../functions/triviaLeaderboard');

module.exports = (interaction) => {
    if (!interaction.isButton()) {
        return;
    }

    if (interaction.customId !== 'triviaRefresh') {
        return;
    }

    triviaLeaderboard(interaction.client);

    interaction.reply({
        content: 'Trivia leaderboard has been refreshed.',
        ephemeral: true
    });
};