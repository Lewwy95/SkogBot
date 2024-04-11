const { SlashCommandBuilder } = require('discord.js');
const { giveFruit } = require('../../functions/giveFruit');
const profileSchema = require('../../schemas/profiles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fruit')
        .setDescription('You can check the amount of fruit a user has or give them some.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check how many fruit a user has.')
                .addUserOption((option) =>
                    option
                        .setName('user')
                        .setDescription('The user who\'s fruit you want to check.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('give')
                .setDescription('Give a user some fruit.')
                .addUserOption((option) =>
                    option
                        .setName('user')
                        .setDescription('The user who you want to give fruit to.')
                        .setRequired(true)
                )
                .addNumberOption((option) =>
                    option
                        .setName('amount')
                        .setDescription('The amount of fruit that you want to give to the user.')
                        .setRequired(true)
                        .setMinValue(1)
                )
        ),
 
    run: async ({ interaction }) => {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'check': {
                const user = interaction.options.getUser('user');

                const query = await profileSchema.findOne({ guildId: interaction.guild.id, userId: user.id });

                if (!query) {
                    interaction.reply({
                        content: `I can\'t seem to check if ${user.displayName} has a basket to store their fruit in.`,
                        ephemeral: true
                    });
                    return;
                }

                if (!query.fruit) {
                    interaction.reply({
                        content: `${user.displayName} has no fruit.`,
                        ephemeral: true
                    });
                    return;
                }

                interaction.reply({
                    content: `${user.displayName} has ${query.fruit} fruit.`,
                    ephemeral: true
                });
            }

            break;

            case 'give': {
                const user = interaction.options.getUser('user');
                const amount = interaction.options.getNumber('amount');

                if (user.id === interaction.user.id) {
                    interaction.reply({
                        content: 'You can\'t give yourself fruit.',
                        ephemeral: true
                    });
                    return;
                }

                const query = await profileSchema.findOne({ guildId: interaction.guild.id, userId: interaction.user.id });

                if (!query) {
                    interaction.reply({
                        content: 'I can\'t seem to check if you have any fruit.',
                        ephemeral: true
                    });
                    return;
                }

                const userQuery = await profileSchema.findOne({ guildId: interaction.guild.id, userId: user.id });

                if (!userQuery) {
                    interaction.reply({
                        content: `I can\'t seem to check if ${user.displayName} has a basket to store their fruit in.`,
                        ephemeral: true
                    });
                    return;
                }

                if (amount > query.fruit) {
                    interaction.reply({
                        content: `You don\'t have that much to give to ${user.displayName}. You have ${query.fruit} fruit.`,
                        ephemeral: true
                    });
                    return;
                }

                giveFruit(interaction.guild.id, interaction.user.id, user.id, amount);

                interaction.reply({
                    content: `You have given ${amount} fruit to ${user.displayName}.`,
                    ephemeral: true
                });

                try {
                    user.send(`${interaction.user.displayName} has given you ${amount} fruit in ${interaction.guild.name}.`);
                } catch {
                    console.log('fruit.js: Target user has direct messages disabled.');
                }
            }

            break;
        }
    }
};