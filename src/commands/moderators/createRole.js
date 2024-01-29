const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('createrole')
    .setDescription('Create a role in this guild.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption((option) =>
        option
            .setName('name')
            .setDescription('The name of the role that you want to create.')
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(24)
    )
    .addStringOption((option) =>
        option
            .setName('colour')
            .setDescription('The colour of the role that you want to create.')
    )
    .addNumberOption((option) =>
        option
            .setName('position')
            .setDescription('The position of the role in the role list that you want to create.')
    )
    .addBooleanOption((option) =>
        option
            .setName('hoist')
            .setDescription('Whether or not the role should display its members in a separate category.')
    )
    .addBooleanOption((option) =>
        option
            .setName('mentionable')
            .setDescription('Whether or not the role is mentionable by members.')
    )
    .addStringOption((option) =>
        option
            .setName('emoji')
            .setDescription('The emoji that will be associated with the role.')
    )
    .addStringOption((option) =>
        option
            .setName('icon')
            .setDescription('The image that will appear next to the role name. Requires a URL to resolve the image.')
    )

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */

async function run({ interaction }) {
    try {
        await interaction.deferReply({ ephemeral: true });
        
        const roleName = interaction.options.getString('name');
        const roleColour = interaction.options.getString('colour');
        const rolePosition = interaction.options.getNumber('position');
        const roleHoist = interaction.options.getBoolean('hoist');
        const roleMentionable = interaction.options.getBoolean('mentionable');
        const roleEmoji = interaction.options.getString('emoji');
        const roleIcon = interaction.options.getString('icon');

        if (rolePosition && interaction.member.roles.highest.position < rolePosition) {
            interaction.followUp(`Role **${roleName}** must have a position of **${interaction.member.roles.highest.position}** or less.`);
            return;
        }

        if ((roleEmoji || roleIcon) && interaction.guild.premiumSubscriptionCount < 7) {
            interaction.followUp('This guild must be level **2** in order to add emojis and/or icons.');
            return;
        }

        const role = await interaction.guild.roles.create({ 
            name: roleName,
            color: roleColour ? roleColour : 'Random',
            position: rolePosition ? rolePosition : null,
            hoist: roleHoist ? roleHoist : null,
            mentionable: roleMentionable ? roleMentionable : null,
            unicodeEmoji: roleEmoji ? roleEmoji : null,
            icon: roleIcon ? roleIcon : null,
            reason: 'Slash Command',
            permissions: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.CreateInstantInvite,
                PermissionFlagsBits.ChangeNickname,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.SendMessagesInThreads,
                PermissionFlagsBits.CreatePublicThreads,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.AddReactions,
                PermissionFlagsBits.UseExternalEmojis,
                PermissionFlagsBits.UseExternalStickers,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.UseApplicationCommands,
                PermissionFlagsBits.SendVoiceMessages,
                PermissionFlagsBits.Connect,
                PermissionFlagsBits.Speak,
                PermissionFlagsBits.Stream,
                PermissionFlagsBits.UseEmbeddedActivities,
                PermissionFlagsBits.UseSoundboard,
                PermissionFlagsBits.UseExternalSounds,
                PermissionFlagsBits.UseVAD
            ]
        });

        interaction.followUp(`The <@&${role.id}> role has been created.`);
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
};

module.exports = { data, run };