const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const { isValidBirthday, refreshUpcomingMessage } = require('../../utils/birthday-utils');
const birthdaySchema = require('../../models/birthday-schema');

const PANEL_BUTTON_IDS = ['birthday_add', 'birthday_amend', 'birthday_delete'];

module.exports = async (interaction) => {
    if (!interaction.isButton() || !PANEL_BUTTON_IDS.includes(interaction.customId)) {
        return;
    }

    try {
        const query = await birthdaySchema.findOne({ guildId: interaction.guild.id }) || await birthdaySchema.create({ guildId: interaction.guild.id });
        const existingIndex = query.birthdays.findIndex(entry => entry.userId === interaction.user.id);

        if (interaction.customId === 'birthday_delete') {
            if (existingIndex === -1) {
                await interaction.reply({ content: 'You don\'t have a birthday saved to delete.', flags: MessageFlags.Ephemeral });
                return;
            }
            query.birthdays.splice(existingIndex, 1);
            await query.save();
            await interaction.reply({ content: 'Your birthday has been removed.', flags: MessageFlags.Ephemeral });
            refreshUpcomingMessage(interaction.guild).catch((error) => console.error('❌ Failed to refresh upcoming birthdays embed:\n', error));
            return;
        }

        if (interaction.customId === 'birthday_add' && existingIndex !== -1) {
            await interaction.reply({ content: 'You already have a birthday saved.', flags: MessageFlags.Ephemeral });
            return;
        }
        if (interaction.customId === 'birthday_amend' && existingIndex === -1) {
            await interaction.reply({ content: 'You don\'t have a birthday saved.', flags: MessageFlags.Ephemeral });
            return;
        }

        const modalId = interaction.customId === 'birthday_add' ? 'birthday_add_modal' : 'birthday_amend_modal';
        const modal = new ModalBuilder()
            .setCustomId(modalId)
            .setTitle(interaction.customId === 'birthday_add' ? 'Add Your Birthday' : 'Amend Your Birthday')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('birthday_day').setLabel('Day (1-31)').setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(2).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('birthday_month').setLabel('Month (1-12)').setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(2).setRequired(true)
                )
            );

        await interaction.showModal(modal);

        const submitted = await interaction.awaitModalSubmit({
            time: 120000,
            filter: (modalInteraction) => modalInteraction.customId === modalId && modalInteraction.user.id === interaction.user.id
        }).catch(() => null);
        if (!submitted) {
            return;
        }

        // Defer immediately - the Mongo calls below can take longer than Discord's 3-second ACK window.
        await submitted.deferReply({ flags: MessageFlags.Ephemeral });

        const day = parseInt(submitted.fields.getTextInputValue('birthday_day'), 10);
        const month = parseInt(submitted.fields.getTextInputValue('birthday_month'), 10);

        if (!isValidBirthday(day, month)) {
            await submitted.editReply({ content: 'That\'s not a valid date. Day must be between 1-31, and Month between 1-12.' });
            return;
        }

        // Re-fetch fresh: time may have passed since the button click while the modal was open.
        const freshQuery = await birthdaySchema.findOne({ guildId: interaction.guild.id }) || await birthdaySchema.create({ guildId: interaction.guild.id });
        const freshIndex = freshQuery.birthdays.findIndex(entry => entry.userId === interaction.user.id);

        if (interaction.customId === 'birthday_add') {
            if (freshIndex !== -1) {
                await submitted.editReply({ content: 'You already have a birthday saved.' });
                return;
            }
            freshQuery.birthdays.push({ userId: interaction.user.id, day, month });
        } else {
            if (freshIndex === -1) {
                await submitted.editReply({ content: 'Your birthday was removed before this could be saved.' });
                return;
            }
            freshQuery.birthdays[freshIndex].day = day;
            freshQuery.birthdays[freshIndex].month = month;
            // birthdays is a loosely-typed Array (Mixed elements) - Mongoose only auto-detects
            // array methods like push/splice, not direct property mutation on a nested object.
            freshQuery.markModified('birthdays');
        }
        await freshQuery.save();

        await submitted.editReply({ content: `Your birthday has been saved as ${day}/${month}.` });
        refreshUpcomingMessage(interaction.guild).catch((error) => console.error('❌ Failed to refresh upcoming birthdays embed:\n', error));
    } catch (error) {
        // A transient Discord API failure (e.g. an expired interaction) must never crash the whole bot.
        console.error(`❌ Birthday interaction handler failed for user ${interaction.user.id}:\n`, error);
    }
};
