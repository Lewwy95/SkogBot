const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('flipcoin')
    .setDescription('The perfect way to decide on something.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

function run({ interaction }) {
    try {
        const result = ['Heads', 'Tails'];

        interaction.reply(`The coin has landed on **${result[Math.floor(Math.random() * result.length)]}**.`);
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};

module.exports = { data, run };