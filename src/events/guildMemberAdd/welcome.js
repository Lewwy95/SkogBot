const { AttachmentBuilder, EmbedBuilder } = require('discord.js');

// List of comments to say to the user when they join the server - feel free to add or amend!
const comments = [
    'Alert: Awesome new member detected!',
    'You just made this server 10% cooler.',
    'Welcome! May your memes be ever spicy.',
    'Brace yourself, notifications are coming.',
    'You\'ve joined the party. Cake is not guaranteed.',
    'Achievement unlocked: Joined the server!',
    'Welcome! Please fasten your seatbelt.',
    'You bring balance to the force... or chaos. We\'ll see.',
    'Welcome! The adventure begins now.',
    'You\'ve entered the chat. May the odds be ever in your favor.',
    'Welcome! Don\'t forget to pet the bots.',
    'You\'re here! Now the fun can really start.',
    'Welcome! We saved you a virtual seat.',
    'You\'ve joined the server — now what?'
];

module.exports = (member) => {
    // Check if there is a welcome channel - if there isn't then we can stop here.
    const channel = member.client.channels.cache.find(channel => channel.name.includes('welcome'));
    if (!channel) {
        return;
    }
    
    // Create an embed to send to the welcome channel.
    const attachment = new AttachmentBuilder('src/images/welcome.png', { name: 'welcome.png' });
    const embed = new EmbedBuilder()
        .setColor('Fuchsia')
        .setTitle('Welcome')
        .setDescription(comments[Math.floor(Math.random() * comments.length)])
        .setThumbnail(`attachment://${attachment.name}`)
        .addFields(
            { name: 'User', value: member.user.displayName, inline: true },
            { name: 'Account Type', value: member.user.bot ? 'Bot' : 'User', inline: true },
            { name: 'Account Created', value: member.user.createdAt.toDateString(), inline: true }
        );

    // Finally, we try to send the embed to the welcome channel!
    channel.send({ content: `<@${member.user.id}>`, embeds: [embed], files: [attachment] }).then(() => {
        console.log(`✅ Welcome message sent for ${member.user.displayName}.`);
    }).catch((error) => {
        console.error(`❌ Welcome message failed to send for ${member.user.displayName}:\n`, error);
    });
};
