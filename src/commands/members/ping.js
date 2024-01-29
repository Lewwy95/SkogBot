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
    try {
        interaction.reply({
            content: `I am online with a ping of **${client.ws.ping}ms**.`,
            ephemeral: true 
        });
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};

module.exports = { data, run };