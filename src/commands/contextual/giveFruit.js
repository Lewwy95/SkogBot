const { ApplicationCommandType, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fruitTraderSchema = require('../../models/fruitTrader');
 
module.exports = {
    data: {
        name: 'Give Fruit',
        type: ApplicationCommandType.User,
    },
 
    run: async ({ interaction }) => {
        const query = await fruitTraderSchema.findOne({ guildId: interaction.guild.id });

        if (!query) {
            await fruitTraderSchema.create({
                guildName: interaction.guild.name,
                guildId: interaction.guild.id
            });

            console.log('✅ Fruit trading system is online.');
            return;
        }

        query.trades.push({ 
            memberId: interaction.user.id, 
            targetId: interaction.targetUser.id 
        });
    
        await query.save();

        const modalGiveFruit = new ModalBuilder()
		    .setCustomId('modalGiveFruit')
		    .setTitle('Give Fruit')

        const modalInputGiveFruit = new TextInputBuilder()
            .setCustomId('modalInputGiveFruit')
            .setLabel('Specify an amount:')
            .setStyle(TextInputStyle.Short)
            .setMinLength(1)
            .setMaxLength(10)

        const modalRow = new ActionRowBuilder().addComponents(modalInputGiveFruit);
        modalGiveFruit.addComponents(modalRow);

        await interaction.showModal(modalGiveFruit);
    }
};