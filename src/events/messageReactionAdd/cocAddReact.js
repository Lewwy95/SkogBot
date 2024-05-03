module.exports = async (reaction, user) => {
    if (user.id === user.client.user.id) {
        return;
    }

    if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch {
			console.log('cocReact.js: Reaction partial failed. Skipping.');
			return;
		}
	}

    if (reaction.message.author.id === reaction.client.user.id && reaction.message.content.includes('Code of Conduct')) {
        const guild = await reaction.client.guilds.fetch(reaction.message.guild.id);
        const verifiedRole = await guild.roles.cache.find((role) => role.name.includes('Verified'));
        const target = await guild.members.cache.get(user.id);

        if (!verifiedRole) {
            console.log('cocReact.js: Verified role missing in guild. Skipping.');
            return;
        }

        if (!target.roles.cache.some(role => role.id === verifiedRole.id)) {
            await target.roles.add(verifiedRole);
        }
    }
};