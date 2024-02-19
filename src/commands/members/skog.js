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
        
    const data = await fetch('https://www.reddit.com/r/Djungelskog/random/.json').then(res => res.json()).catch(console.error);

    console.log(data);

    setTimeout(function() {
        interaction.followUp({ embeds: [new EmbedBuilder().setImage(`${data[0].data.children[0].data.url}`)] });
    }, 3000);
};

module.exports = { data, run };