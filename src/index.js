const { Client } = require('discord.js');
const { CommandKit } = require('commandkit');
const { database, token } = require('./utils/cross-env');
const mongoose = require('mongoose');
const path = require('path');

const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'GuildMessagePolls', 'MessageContent'] // Add more when needed
});

mongoose.connect(database).then(() => {
    console.log('✅ Connected to the MongoDB database.');
});

new CommandKit({
    client,
    commandsPath: path.join(__dirname, 'commands'),
    eventsPath: path.join(__dirname, 'events'),
    bulkRegister: true
});

client.login(token);