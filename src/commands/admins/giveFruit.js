const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { giveFruit } = require('../../functions/giveFruit');

const data = new SlashCommandBuilder()
    .setName('givefruit')
    .setDescription('Give a member some fruit.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
        option
            .setName('member')
            .setDescription('Select a member to give some fruit to.')
            .setRequired(true)
    )
    .addNumberOption((option) =>
        option
            .setName('amount')
            .setDescription('Specify the amount of fruit to give to this member.')
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

    await giveFruit(interaction.guild.id, member.id, amount);

    interaction.followUp(`You have given **${amount}** fruit to **${member.username}**.`);
};

module.exports = { data, run };