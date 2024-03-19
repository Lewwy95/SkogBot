const { ApplicationCommandType } = require('discord.js');
const { checkFruit } = require('../../functions/checkFruit');
 
module.exports = {
    data: {
        name: 'Check Fruit',
        type: ApplicationCommandType.User,
    },
 
    run: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });

        const amount = await checkFruit(interaction.guild.id, interaction.targetUser.id);

        if (!amount) {
            interaction.followUp('This member has no fruit.');
            return;
        }

        interaction.followUp(`This member has **${amount}** fruit.`);
    }
};