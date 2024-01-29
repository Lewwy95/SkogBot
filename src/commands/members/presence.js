const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('presence')
    .setDescription('Fetch a list of members playing a particular game or piece of software.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addStringOption((option) =>
        option
            .setName('value')
            .setDescription('The presence that you want to check against.')
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(24)
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    try {
        await interaction.deferReply({ ephemeral: true });
        
        const presence = interaction.options.getString('value');

        let group = [];
        let members = await interaction.guild.members.fetch();

        members.forEach(member => {
            if (!member.presence || !member.presence.activities[0]) {
                return;
            }
    
            let currentPresence = member.presence.activities[0].name;
    
            if (currentPresence.toLowerCase() == presence.toLowerCase()) {
                group.push({
                    member: member.id,
                    value: currentPresence
                });
            } else {
                return;
            }
        });

        group = group.slice(0, 1000);

        let message;

        group.forEach(value => {
            const member = interaction.guild.members.cache.get(value.member);
            message += `<@${member.user.id}>\n`
        });

        if (message) {
            message = message.replace('undefined', '');
            interaction.followUp(`Here are a list of members with a presence of **${presence}**:\n\n${message}`);
        } else {
            interaction.followUp(`There are no members with a presence of **${presence}**.`);
        }
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};

module.exports = { data, run };