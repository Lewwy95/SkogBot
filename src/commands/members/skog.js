const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const data = new SlashCommandBuilder()
    .setName('skog')
    .setDescription('Fetch a random image of Djungelskog from Reddit.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.EmbedLinks)

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    await interaction.deferReply();
        
    const data = await fetch('https://meme-api.com/gimme/Djungelskog').then(res => res.json());

    interaction.followUp({ embeds: [new EmbedBuilder().setImage(`${data.url}`)] });
};

module.exports = { data, run };