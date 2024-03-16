const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { takeFruit } = require('../../functions/takeFruit');

const data = new SlashCommandBuilder()
    .setName('takefruit')
    .setDescription('Take away some fruit from a member.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
        option
            .setName('member')
            .setDescription('Select a member that you want to take some fruit from.')
            .setRequired(true)
    )
    .addNumberOption((option) =>
        option
            .setName('amount')
            .setDescription('Specify the amount of fruit to take from this member.')
            .setRequired(true)
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    const member = interaction.options.getUser('member');
    const amount = interaction.options.getNumber('amount');

    await interaction.deferReply({ ephemeral: true });

    if (amount <= 0) {
        interaction.followUp('The amount of fruit specified is invalid.');
        return;
    }

    await takeFruit(interaction.guild.id, member.id, amount);

    interaction.followUp(`You have taken **${amount}** fruit from **${member.username}**.`);
};

module.exports = { data, run };