const { fruitLeaderboard } = require('../../functions/fruitLeaderboard');

module.exports = (interaction) => {
    if (!interaction.isButton()) {
        return;
    }

    if (interaction.customId !== 'fruitRefresh') {
        return;
    }

    fruitLeaderboard(interaction.client);

    interaction.reply({
        content: 'Fruit leaderboard has been refreshed.',
        ephemeral: true
    });
};