const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const data = new SlashCommandBuilder()
    .setName('skog')
    .setDescription('Fetch an image of Djungelskog from Reddit.')

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    // Keep the member waiting while the command is processing
    await interaction.deferReply();

    // Put this in a try catch in case it fails
    try {
        // Try to fetch the json file from Reddit
        const data = await fetch('https://meme-api.com/gimme/Djungelskog').then(res => res.json());

        // Follow up with the instigator
        return await interaction.followUp({ 
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('🐻 Djungelskog')
                .setDescription(`<@${interaction.user.id}> requested a Reddit post of Djungelskog.`)
                .setImage(`${data.url}`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .addFields({
                    name: 'Title',
                    value: `${data.title}`,
                }, {
                    name: 'Author',
                    value: `${data.author}`,
                    inline: true
                }, {
                    name: 'Up Votes',
                    value: `\`${data.ups}\``,
                    inline: true
                }, {
                    name: `Link`,
                    value: `${data.postLink}`
                })
            ],
            allowedMentions: false
        });
    } catch {
        // Delete the reply if the fetch failed
        return await interaction.deleteReply();
    }
};

/**
 * @type {import('commandkit').CommandOptions}
 */

const options = {
    dm_permission: false,
    userPermissions: ['SendMessages']
};

module.exports = { data, run, options };
