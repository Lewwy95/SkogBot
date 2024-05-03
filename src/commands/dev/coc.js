const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const redis = require('../../functions/redis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coc')
        .setDescription('Spawn an instance of the Code of Conduct or modify it.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit an existing instance of the Code of Conduct.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('spawn')
                .setDescription('Spawn a new instance of the Code of Conduct.')
        ),
 
    run: async ({ interaction }) => {
        const channel = await interaction.guild.channels.cache.find((channel) => channel.name.includes('conduct'));

        if (!channel) {
            interaction.reply({
                content: 'No Code of Conduct exists in the guild.',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();
        const string = `**Introduction**\nThis code sets out all of the expected behaviour when participating in the ${interaction.guild.name} guild and outlines the consequences of misconduct.\nThis code applies to all participants of the ${interaction.guild.name} guild who have clicked/pressed the below react in order to agree to it.\nModerators will remove any posts that they believe are in breach of this code.\nUsers will be warned and/or removed from the ${interaction.guild.name} guild if deemed necessary by the Moderator team when in breach of this code.\n\n**Code of Conduct**\nAlways act with respect and civility towards other users.\nAbide by any applicable channel rules and do not attempt to exploit them.\nMaintain a socially acceptable standard when talking in public channels.\nActs or statements of discrimination relating to age, disability, gender reassignment, marriage/civil partnership status, race, religion or belief, sex or sexual orientation will not be tolerated.\nPersonal attacks towards another user will not be tolerated.\nActing in a manner which brings ${interaction.guild.name} into disrepute will not be tolerated.\nRevealing sensitive information regarding various user's employers will not be tolerated.\n\n**Agreeance**\nPlease click/press the react below to agree to the ${interaction.guild.name} guild Code of Conduct.\nOnce you have agreed to it then you must follow it at all times.\nFailure to comply will result in the consequences of misconduct which are highlighted above.`;

        switch (subcommand) {
            case 'edit': {
                const query = await redis.get(channel.id);

                if (query) {
                    const cache = await JSON.parse(query);
                    
                    try {
                        const message = await channel.messages.fetch(cache.messageId);
                        message.edit(string);
                    } catch (err) {
                        interaction.reply({
                            content: 'The existing instance of the Code of Conduct is missing.',
                            ephemeral: true
                        });
                    }
                } else {
                    interaction.reply({
                        content: 'No existing instance of the Code of Conduct found.',
                        ephemeral: true
                    });
                    return;
                }

                interaction.reply({
                    content: 'I have edited an existing instance of the Code of Conduct.',
                    ephemeral: true
                });
            }

            break;

            case 'spawn': {
                const message = await channel.send(string);
                message.react('✅');

                await redis.set(channel.id, JSON.stringify({ messageId: message.id }));
    
                interaction.reply({
                    content: 'I have spawned a new instance of the Code of Conduct.',
                    ephemeral: true
                });
            }

            break;
        }
    }
};