const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Create a vote that other users can vote on.')
        .addStringOption((option) =>
            option
                .setName('content')
                .setDescription('The details of your vote.')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(850)
        ),
 
    run: async ({ interaction }) => {
        const vote = interaction.options.getString('content');

        const message = await interaction.channel.send({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('📃 Vote')
                .setDescription(`A new vote has been started by ${interaction.user.displayName}.`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .addFields({
                    name: 'Details',
                    value: `"${vote}"`
                })
            ]
        });

        await message.react('⬆️');
        message.react('⬇️');

        interaction.reply({
            content: `Your vote has now started.`,
            ephemeral: true
        });
    }
};