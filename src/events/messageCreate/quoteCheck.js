module.exports = async (message) => {
    const channel = await message.client.channels.cache.find((channel) => channel.name.includes('quote'));

    if (!channel) {
        console.log('quote.js: No channel with "quote" exists in guild.');
        return;
    }

    if (message.channel.id === channel.id && message.author.id !== message.client.user.id) {
        if (message.content.includes('"') || message.content.includes('-')) {
            message.reply('Are you trying to add a quote? You can use **/quote add** for that.');
        }
    }
};