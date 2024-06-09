const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const birthdaySchema = require('../../schemas/birthdays');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('You can check any upcoming birthdays or add your own.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add your birthday so that other users can be notified when it\'s your special day.')
                .addStringOption((option) =>
                    option
                        .setName('date')
                        .setDescription('The date of your birthday (DD/MM).')
                        .setRequired(true)
                        .setMinLength(5)
                        .setMaxLength(5)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check for any upcoming birthdays.')
        ),
 
    run: async ({ interaction }) => {
        let query = await birthdaySchema.findOne({ guildId: interaction.guild.id });

        if (!query) {
            await birthdaySchema.create({
                guildId: interaction.guild.id,
                guildName: interaction.guild.name
            });

            query = await birthdaySchema.findOne({ guildId: interaction.guild.id });

            console.log('birthday.js: A birthday object has been created in the database.');
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add': {
                const date = interaction.options.getString('date');

                if (!date.includes('/')) {
                    interaction.reply({
                        content: 'The date that you provided was the wrong format. An example would be "10/03" which is Lewwy\'s birthday.',
                        ephemeral: true
                    });
                    return;
                }

                let birthdayExists;

                query.birthdays.every(function(value) {
                    user = interaction.guild.members.cache.find(member => member.id === value.userId);

                    if (user) {
                        birthdayExists = true;
                    }
                });

                if (birthdayExists) {
                    interaction.reply({
                        content: 'You have already added your birthday.',
                        ephemeral: true
                    });
                    return;
                }

                const split = date.split('/');
                const birthdayDay = split[0];
                const birthdayMonth = split[1];
                const birthdayYear = new Date().getFullYear();

                query.birthdays.push({ 
                    userId: interaction.user.id,
                    birthday: new Date(`${birthdayYear}-${birthdayMonth}-${birthdayDay}T08:00:00.0000`)
                });

                await query.save();

                interaction.reply({
                    content: 'I have saved your birthday and will let other users know when it\'s your special day.',
                    ephemeral: true
                });
            }

            break;

            case 'check': {
                let user;
                let birthdayString = '';

                query.birthdays.forEach(async (value) => {
                    user = interaction.guild.members.cache.find(member => member.id === value.userId);

                    if (!user) {
                        return;
                    }

                    if (value.birthday < Date.now()) {
                        return;
                    }

                    birthdayString += `- ${user.displayName}: <t:${Math.floor(value.birthday / 1000)}:R>\n`;
                });

                if (birthdayString.length === 0) {
                    birthdayString = `There are no upcoming birthdays.`;
                }

                const attachment = new AttachmentBuilder('src/images/birthdayImage.png', { name: 'birthdayImage.png' });

                interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Purple')
                        .setTitle('🎂 Check Birthdays')
                        .setDescription('Displaying all upcoming birthdays.')
                        .setThumbnail(`attachment://${attachment.name}`)
                        .addFields({
                            name: 'Result',
                            value: birthdayString
                        })
                    ],
                    ephemeral: true,
                    files: [attachment]
                });
            }

            break;
        }
    }
};