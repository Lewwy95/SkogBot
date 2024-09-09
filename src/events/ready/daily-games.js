const schedule = require('node-schedule');
const mindReader = require('../../games/mind-reader');
const mysteryWord = require('../../games/mystery-word');
const riddleRush = require('../../games/riddle-rush');
const wouldRather = require('../../games/would-rather');
const trivia = require('../../games/trivia');

module.exports = async (c) => {
    // Schedule a random game to be played every day at lunchtime.
    schedule.scheduleJob({ hour: 12, minute: 0 }, function() {
        const games = [mindReader, mysteryWord, riddleRush, trivia, wouldRather];
        const selectedGame = games[Math.floor(Math.random() * games.length)];
        selectedGame(c);
    });
    };