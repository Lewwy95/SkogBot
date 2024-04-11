const { fruitLeaderboard } = require('../../functions/fruitLeaderboard');
const { triviaLeaderboard } = require('../../functions/triviaLeaderboard');

module.exports = (client) => {
    fruitLeaderboard(client);
    triviaLeaderboard(client);
};