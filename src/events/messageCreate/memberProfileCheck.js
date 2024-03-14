const memberProfileSchema = require('../../models/memberProfile');

module.exports = async (message) => {
    if (message.author.bot) {
        return;
    }
    
    const query = await memberProfileSchema.findOne({ guildId: message.guild.id, memberId: message.author.id });

    if (!query) {
        await memberProfileSchema.create({
            guildId: message.guild.id,
            guildName: message.guild.name,
            memberName: message.author.username,
            memberId: message.author.id
         });
    }
};