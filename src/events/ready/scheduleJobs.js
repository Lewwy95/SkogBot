const schedule = require('node-schedule');
const { dailyFact } = require('../../functions/dailyFact');
const { trivia } = require('../../functions/trivia');

module.exports = (client) => {
    schedule.scheduleJob({ hour: 7, minute: 30 }, function() {
        dailyFact(client);
    });

    schedule.scheduleJob({ hour: 11, minute: 45 }, function() {
        trivia(client, 1);
    });
    
    schedule.scheduleJob({ hour: 12, minute: 0 }, function() {
        trivia(client, 2);
    });
};