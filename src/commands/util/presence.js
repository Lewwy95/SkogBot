const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('presence')
    .setDescription('Fetch a list of members playing a particular game or piece of software.')
    .addStringOption((option) =>
        option
            .setName('value')
            .setDescription('Specify the presence name that you want to filter members by.')
            .setRequired(true)
            .setMaxLength(204)
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    // Keep the member waiting while the command is processing
    await interaction.deferReply({ ephemeral: true });

    // Get the parameter from the command
    const presence = interaction.options.getString('value');

    // Create an empty array to store the members into
    let group = [];

    // Get the members of the guild
    let members = await interaction.guild.members.fetch();

    // Loop through each member in the guild
    members.forEach(async member => {
        // Return if no member is playing anything
        if (!member.presence || !member.presence.activities[0]) return;

        // Store the current presence to a variable
        let currentPresence = member.presence.activities[0].name;

        // If the presence matches the instigator's specified presence then push it to the group array
        if (currentPresence.toLowerCase() == presence.toLowerCase()) group.push({
            member: member.id,
            game: currentPresence
        });
        else return;
    });

    // Slice the group array so we don't crash the bot
    group = group.slice(0, 1000);

    // Create a new embed
    const embed = new EmbedBuilder()
    embed.setColor('Purple')
    embed.setTitle('🔍 Presence Finder')
    embed.setDescription(`Displaying members with your specified presence below.`)
    embed.addFields({
        name: 'Presence',
        value: `${presence}`
    })

    // Create a string variable for the embed
    let string;

    // Add each member with the same presence as the instigator specified to the embed string
    group.forEach(async value => {
        const member = interaction.guild.members.cache.get(value.member);
        string += `<@${member.user.id}>\n`
    });

    // Modify the embed if the string variable is populated
    if (string) {
        string = string.replace("undefined", "");
        embed.addFields({
            name: 'Matches Found',
            value: `${string}`
        })
    } else {
        embed.addFields({
            name: 'Matches Found',
            value: 'Nobody'
        })
    }

    // Return the embed to the instigator
    return await interaction.followUp({
        embeds: [embed],
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

module.exports = {
    data,
    run,
    options
};