const { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('simulate')
    .setDescription('Simulate a member joining the guild.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('Select a member.')
            .setRequired(true)
    );

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction, client }) {
    // Keep the member waiting while the command is processing
    await interaction.deferReply({ ephemeral: true });

    // Get the system channel
    const channel = interaction.guild.systemChannel;

    // Return an error if the system channel has not been set
    if (!channel) {
        return await interaction.followUp({ 
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setDescription('❌ The system channel has not been set for this guild.')
            ],
            ephemeral: true
        }).catch(console.error);
    }

    // Get the target from the command
    const target = interaction.options.getUser('target');

    // Get the target from cache
    const member = interaction.guild.members.cache.get(target.id) || (await interaction.guild.members.fetch(target.id));

    // Emit the join event as the target
    client.emit('guildMemberAdd', member);

    // Follow up with the instigator
    return await interaction.followUp({ 
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setDescription(`✅ I have simulated <@${member.id}> joining the <#${channel.id}> channel.`)
        ],
        ephemeral: true
    }).catch(console.error);
};

/**
 * @type {import('commandkit').CommandOptions}
 */

const options = {
    dm_permission: false,
    userPermissions: ['Administrator']
};

module.exports = { data, run, options };