const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ms = require('ms');

const data = new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Why decide on something yourself when a coin can do it for you.')

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    // Keep the member waiting while the command is processing
    await interaction.deferReply();

    // Specify the results of the coin flip
    const result = ['Heads', 'Tails'];

    // Send the coin flip to the member's channel
    return await interaction.followUp({
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('🪙 Coin Flip')
            .setDescription(`<@${interaction.user.id}> has flipped a coin.`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields({
                name: 'Result',
                value: `${result[Math.floor(Math.random() * result.length)]}`
            })
        ],
        allowedMentions: false
    }).catch(console.error);
};

/**
 * @type {import('commandkit').CommandOptions}
 */

const options = {
    dm_permission: false,
    userPermissions: ['SendMessages']
};

module.exports = {
    data,
    run,
    options
};