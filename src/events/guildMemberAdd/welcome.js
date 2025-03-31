const { AttachmentBuilder, EmbedBuilder } = require('discord.js');

// List of comments to say to the user when they join the server - feel free to add or amend!
const comments = [
    'We\'ve been waiting for someone to blame everything on.',
    'Commence protocol: Awkwardly pretend we\'re all cool.',
    'We\'d offer you a guide, but we\'re all lost too.',
    'Your free trial of hanging out with us has just begun.',
    'No pressure, but we\'re all watching to see what you\'ll do next.',
    'Our 100th member! Just kidding, we lost count ages ago.',
    'We\'re all a little strange, but you\'ll get used to it.',
    'Welcome! We promise we don\'t bite... much.',
    "We\'re like a family here, but one of those weird ones. You know the type.",
    'Welcome to the circus! We hope you brought popcorn.',
    'We\'re not saying you\'re the best, but you\'re definitely in the top one.',
    'Welcome to the server! We hope you brought snacks.',
    'You\'re the missing puzzle piece we didn\'t know we needed.',
    'Congratulations! You\'ve just unlocked the secret level of our server.',
    'Welcome to the server! We hope you brought your sense of humor.',
    'You\'re officially part of the coolest club in town.',
    'You\'re now part of our little corner of the internet.'
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