const { Client, GatewayIntentBits } = require('discord.js');
const { CommandKit } = require('commandkit');
const { token, database } = require('./config/cross-env');
const mongoose = require('mongoose');
const path = require('path');

// Create a new Discord client with the specified intents - feel free to add or remove intents as needed!
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

// Initialise a new CommandKit instance.
// This will automatically register all commands and events in the specified directories!
new CommandKit({
    client,
    commandsPath: path.join(__dirname, 'commands'),
    eventsPath: path.join(__dirname, 'events'),
    bulkRegister: true
});

// Connect to the MongoDB database using the connection string from the .env file.
mongoose.connect(database).then(() => {
    console.log('✅ Connected to the MongoDB database.');
}).catch((error) => {
    console.error('❌ Failed to connect to the MongoDB database:\n', error);
});

// Log the client in using a token from the .env file.
client.login(token).then(() => {
    console.log('✅ Client authorisation successful.');
}).catch((error) => {
    console.error('❌ Client authorisation failed:\n', error);
});