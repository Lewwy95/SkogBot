const schedule = require('node-schedule');
const mindReader = { name: 'mindReader', play: require('../../games/mind-reader') };
const mysteryWord = { name: 'mysteryWord', play: require('../../games/mystery-word') };
const riddleRush = { name: 'riddleRush', play: require('../../games/riddle-rush') };
const wouldRather = { name: 'wouldRather', play: require('../../games/would-rather') };
const trivia = { name: 'trivia', play: require('../../games/trivia') };

// Define the weighting for each game - the total of all weights should add up to around 10!
// The higher the number, the more likely the game will be selected.
const gameWeights = {
    mindReader: 2,
    mysteryWord: 2,
    riddleRush: 2,
    trivia: 2,
    wouldRather: 2
};

// Function to select a game based on the weights provided above.
function selectWeightedGame(games, weights) {
    const weightedGames = [];
    for (const game of games) {
        for (let i = 0; i < weights[game.name]; i++) {
            weightedGames.push(game);
        }
    }
    return weightedGames[Math.floor(Math.random() * weightedGames.length)];
};

module.exports = async (c) => {
    // Schedule a game to be played every day at midday.
    schedule.scheduleJob({ hour: 12, minute: 0 }, function() {
        const games = [mindReader, mysteryWord, riddleRush, trivia, wouldRather];
        const selectedGame = selectWeightedGame(games, gameWeights);
        selectedGame.play(c);
    });
};