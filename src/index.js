const { Client, GatewayIntentBits } = require('discord.js');
const { CommandKit } = require('commandkit');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: `${process.cwd()}/.${process.env.NODE_ENV.replace(' ', '')}.env` });

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ]
});

mongoose.connect(process.env.DATABASE).then(() => {
    client.login(process.env.TOKEN);
});

new CommandKit({
    client,
    commandsPath: path.join(__dirname, 'commands'),
    eventsPath: path.join(__dirname, 'events'),
    //validationsPath: path.join(__dirname, 'validations'),
    devGuildIds: ['1177368171179688007'],
    devUserIds: ['346742882213953536'],
    skipBuiltInValidations: true,
    bulkRegister: true
});