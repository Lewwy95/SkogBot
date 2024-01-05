const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { CommandKit } = require('commandkit');
const { Database } = require('quickmongo');
const { token, database } = require('./config');
const path = require('path');
const db = new Database(`${database}`);
 
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction
    ]
});

(async () => { await db.connect(); })();
module.exports = db;

new CommandKit({
    client,
    commandsPath: path.join(__dirname, 'commands'),
    eventsPath: path.join(__dirname, 'events'),
    bulkRegister: true
});
 
client.login(`${token}`);