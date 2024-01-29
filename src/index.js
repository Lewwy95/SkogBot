const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { CommandKit } = require('commandkit');
const mongoose  = require('mongoose');
const { token, database } = require('./config');
const path = require('path');

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

mongoose.connect(database).then(() => {
    console.log('✅ Connected to the MongoDB database.');

    new CommandKit({
        client,
        commandsPath: path.join(__dirname, 'commands'),
        eventsPath: path.join(__dirname, 'events'),
        bulkRegister: true
    });
    
    client.login(`${token}`);
});