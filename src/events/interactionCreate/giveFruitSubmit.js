const { checkFruit } = require('../../functions/checkFruit');
const { giveFruit } = require('../../functions/giveFruit');
const { takeFruit } = require('../../functions/takeFruit');
const fruitTraderSchema = require('../../models/fruitTrader');

module.exports = async (interaction) => {
    if (!interaction.isModalSubmit()) {
        return;
    }

    if (interaction.customId !== 'modalGiveFruit') {
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    const query = await fruitTraderSchema.findOne({ guildId: interaction.guild.id });

    if (!query) {
        interaction.followUp('This system is currently offline.');
        return;
    }

    const giveAmount = interaction.fields.getTextInputValue('modalInputGiveFruit');

    if (giveAmount <= 0 || isNaN(giveAmount)) {
        interaction.followUp('The amount of fruit that was specified is invalid.');
        return;
    }

    const memberFruit = await checkFruit(interaction.guild.id, interaction.user.id);

    if (memberFruit < giveAmount) {
        interaction.followUp('You don\'t have enough fruit.');
        return;
    }

    query.trades.forEach(async (value) => {
        if (value.memberId === interaction.user.id && value.targetId !== interaction.user.id) {
            await takeFruit(interaction.guild.id, interaction.user.id, giveAmount);
            await giveFruit(interaction.guild.id, value.targetId, giveAmount);

            interaction.followUp(`You have given **${giveAmount}** fruit to this member.`);
        } else {
            interaction.followUp(`You are unable to give this member **${giveAmount}** fruit.`);
        }
    });

    await query.updateOne({
        guildId: interaction.guild.id,
        trades: []
    });
};