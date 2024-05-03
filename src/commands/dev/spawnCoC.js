const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spawn-coc')
        .setDescription('Spawn an instance of the Code of Conduct.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
 
    run: async ({ interaction }) => {
        const message = await interaction.channel.send({
            content: `**Introduction**\nThis code sets out all of the expected behaviour when participating in the ${interaction.guild.name} guild and outlines the consequences of misconduct.\nThis code applies to all participants of the ${interaction.guild.name} guild who have clicked/pressed the below react in order to agree to it.\nModerators will remove any posts that they believe are in breach of this code.\nUsers will be warned and/or removed from the ${interaction.guild.name} guild if deemed necessary by the Moderator team when in breach of this code.\n\n**Code of Conduct**\nAlways act with respect and civility towards other users.\nAbide by any applicable channel rules and do not attempt to exploit them.\nMaintain a socially acceptable standard when talking in public channels.\nActs or statements of discrimination relating to age, disability, gender reassignment, marriage/civil partnership status, race, religion or belief, sex or sexual orientation will not be tolerated.\nPersonal attacks towards another user will not be tolerated.\nActing in a manner which brings ${interaction.guild.name} into disrepute will not be tolerated.\nRevealing sensitive information regarding various user's employers will not be tolerated.\n\n**Agreeance**\nPlease click/press the react below to agree to the ${interaction.guild.name} guild Code of Conduct.\nOnce you have agreed to it then you must follow it at all times.\nFailure to comply will result in the consequences of misconduct which are highlighted above.`
        });

        message.react('✅');

        interaction.reply({
            content: 'I have spawned an instance of the Code of Conduct.',
            ephemeral: true
        });
    }
};