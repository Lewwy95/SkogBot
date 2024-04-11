const profileSchema = require('../../schemas/profiles');

module.exports = async (oldMember, newMember) => {
    if (newMember.user.id === newMember.client.user.id) {
        return;
    }
    
    const query = await profileSchema.findOne({ guildId: newMember.guild.id, userId: newMember.user.id });

    if (!query) {
        await profileSchema.create({
            guildId: newMember.guild.id,
            guildName: newMember.guild.name,
            userId: newMember.user.id,
            username: newMember.user.username,
            displayName: newMember.user.displayName,
        });
    }
};