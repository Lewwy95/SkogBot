const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('If you think you can improve the guild then we\'d love to hear from you.')
        .addStringOption((option) =>
            option
                .setName('content')
                .setDescription('The details of your suggestion.')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(850)
        ),
 
    run: async ({ interaction }) => {
        const channel = await interaction.client.channels.cache.find((channel) => channel.name.includes('suggest'));

        if (!channel) {
            interaction.reply({
                content: 'The suggestion system has no channel.',
                ephemeral: true
            });

            console.log('suggest.js: No channel with "suggest" exists in guild.');
            return;
        }

        const suggestion = interaction.options.getString('content');

        const message = await channel.send({
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('💭 Suggestion')
                .setDescription(`A new suggestion has been submitted by ${interaction.user.displayName}.`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .addFields({
                    name: 'Details',
                    value: `"${suggestion}"`
                })
            ]
        });

        await message.react('⬆️');
        message.react('⬇️');

        interaction.reply({
            content: `Your suggestion has been submitted and can be viewed in the <#${channel.id}> channel.`,
            ephemeral: true
        });
    }
};