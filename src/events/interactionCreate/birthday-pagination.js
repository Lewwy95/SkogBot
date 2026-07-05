const { AttachmentBuilder } = require('discord.js');
const redis = require('../../config/redis');
const { buildUpcomingEmbed, buildUpcomingPaginationRow } = require('../../utils/birthday-utils');

const PAGINATION_BUTTON_IDS = ['birthday_upcoming_prev', 'birthday_upcoming_next'];

module.exports = async (interaction) => {
    if (!interaction.isButton() || !PAGINATION_BUTTON_IDS.includes(interaction.customId)) {
        return;
    }

    try {
        const pageKey = `${interaction.guild.id}_birthdayupcomingpage`;
        const stored = await redis.get(pageKey);
        let page = stored ? parseInt(stored, 10) || 0 : 0;
        page += interaction.customId === 'birthday_upcoming_next' ? 1 : -1;
        if (page < 0) {
            page = 0;
        }

        const { embed, totalPages, page: clampedPage } = await buildUpcomingEmbed(interaction.guild, page);
        await redis.set(pageKey, String(clampedPage));

        const row = buildUpcomingPaginationRow(clampedPage, totalPages);
        const attachment = new AttachmentBuilder('src/images/upcoming-birthdays.png', { name: 'upcoming-birthdays.png' });

        await interaction.update({ embeds: [embed], components: row ? [row] : [], files: [attachment] });
    } catch (error) {
        console.error(`❌ Upcoming birthdays pagination failed for user ${interaction.user.id}:\n`, error);
    }
};
