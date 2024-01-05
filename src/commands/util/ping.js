const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Send me a ping to check that I\'m online.')

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction, client }) {
    // Keep the member waiting while the command is processing
    await interaction.deferReply({ ephemeral: true });

    // Follow up with the instigator
    return await interaction.followUp({ 
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setDescription(`I am online with a ping of **${client.ws.ping}ms**.`)
        ],
        ephemeral: true
    }).catch(console.error);
};

/**
 * @type {import('commandkit').CommandOptions}
 */

const options = {
    dm_permission: false,
    userPermissions: ['SendMessages']
};

module.exports = { data, run, options };
