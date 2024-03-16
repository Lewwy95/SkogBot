const memberProfileSchema = require('../../models/memberProfile');

module.exports = async (oldMember, newMember) => {
    if (newMember.user.id === newMember.client.user.id) {
        return;
    }
    
    const query = await memberProfileSchema.findOne({ guildId: newMember.guild.id, memberId: newMember.user.id });

    if (!query) {
        await memberProfileSchema.create({
            guildId: newMember.guild.id,
            guildName: newMember.guild.name,
            memberName: newMember.user.username,
            memberId: newMember.user.id
         });
    }
};