const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Useful for checking if the bot is online.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

function run({ interaction, client }) {
    interaction.reply({
        content: `I am online with a ping of **${client.ws.ping}ms**.`,
        ephemeral: true 
    });
};

module.exports = { data, run };