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
    const result = ['Heads', 'Tails'];
    interaction.reply(`The coin has landed on **${result[Math.floor(Math.random() * result.length)]}**.`);
};

module.exports = { data, run };