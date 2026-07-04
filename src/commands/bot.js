const { SlashCommandBuilder } = require('discord.js');
const OWNER_ID = '346742882213953536';

const data = new SlashCommandBuilder()
    .setName('bot')
    .setDescription('Control the bot process.')
    .addSubcommand((subcommand) => subcommand
        .setName('stop')
        .setDescription('Emergency stop the bot. It will not automatically restart.'))
    .addSubcommand((subcommand) => subcommand
        .setName('restart')
        .setDescription('Restart the bot.'));

async function run({ interaction }) {
    if (interaction.user.id !== OWNER_ID) {
        await interaction.reply({ content: 'You are not authorised to use this command.', ephemeral: true });
        return;
    }

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        case 'stop': {
            await interaction.reply({ content: '🛑 Stopping the bot. It will **not** restart automatically - use Portainer dashboard to bring it back up.', ephemeral: true });
            console.log(`⚠️ Bot stop triggered by ${interaction.user.tag} (${interaction.user.id}).`);
            // Exit code 0 - with the container's restart policy set to "on-failure", Docker treats
            // this as a clean exit and leaves it stopped, rather than bringing it straight back up.
            setTimeout(() => process.exit(0), 1000);
            break;
        }
        case 'restart': {
            await interaction.reply({ content: '🔄 Restarting the bot...', ephemeral: true });
            console.log(`⚠️ Bot restart triggered by ${interaction.user.tag} (${interaction.user.id}).`);
            // Exit code 1 - with the container's restart policy set to "on-failure", Docker treats
            // this as a failure and immediately restarts the container.
            setTimeout(() => process.exit(1), 1000);
            break;
        }
    }
}

module.exports = { data, run };
