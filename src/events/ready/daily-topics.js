const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const schedule = require('node-schedule');
const redis = require('../../config/redis');

// Topics that will hopefully inspire and motivate users - feel free to add or amend!
const topics = [
    'What\'s a childhood toy or game that you\'d love to see make a comeback?',
    'If you could invent any gadget, what would it do?',
    'What\'s one thing you think everyone should try at least once in their life?',
    'What\'s the most interesting fact you know?',
    'What\'s the best piece of advice you\'ve ever been given?',
    'What\'s the most underrated TV show, movie or book that you think more people should know about?',
    'If you could live in any fictional universe, which one would it be and why?',
    'What\'s the most interesting place you\'ve ever visited?',
    'What\'s a fun or interesting fact you learned recently?',
    'What\'s the funniest or most embarrassing story you\'ve heard or experienced?',
    'If you could open any type of business without worrying about money, what would it be and why?',
    'If you could have any superpower, but only for one day, what would it be and why?',
    'If you had to eat only one food for the rest of your life, which one would you choose and why?',
    'If you could live anywhere in the world for a year, where would it be and why?',
    'What\'s the most interesting or unusual job you\'ve ever had?',
    'If you could meet any historical figure, who would it be and what would you ask them?',
    'If you won the lottery tomorrow, what\'s the first thing that you\'d do?',
    'If you could swap lives with someone for a week, who would it be and why?'
];

module.exports = async (c) => {
    // Schedule the daily topics event to run every day.
    schedule.scheduleJob({ hour: 8, minute: 0 }, async function() {
        // Check if there is a daily topics channel - if there isn't then we can stop here.
        const channel = c.channels.cache.find(channel => channel.name.includes('topic'));
        if (!channel) {
            return;
        }

        // Get a random topic from the topics array.
        let selectedTopic = topics[Math.floor(Math.random() * topics.length)];

        // Fetch the daily topics blacklist from Redis and parse the data if it exists (if not then we can create it later).
        // This will hopefully prevent the same topic from being sent again!
        const query = await redis.get(`${channel.guild.id}_topics_blacklist`);
        let data = [];
        if (query) {
            data = JSON.parse(query);
        }

        // Here we check if the selected topic is already blacklisted - we'll pick a new one if it is.
        const isBlacklisted = data.includes(selectedTopic);
        if (isBlacklisted) {
            const nextTopics = topics.filter(topic => !data.includes(topic));
            selectedTopic = nextTopics[Math.floor(Math.random() * nextTopics.length)];
        }

        // If there are no topics left to send then we can stop here.
        if (selectedTopic === undefined) {
            console.error('❌ There are no daily topics left.');
            return;
        }

        // Add the selected topic to the blacklist.
        data.push(selectedTopic);
        await redis.set(`${channel.guild.id}_topics_blacklist`, JSON.stringify(data));
        
        // Create an embed with the selected topic.
        const attachment = new AttachmentBuilder('src/images/daily-topics.png', { name: 'daily-topics.png' });
        const embed = new EmbedBuilder()
            .setColor('Fuchsia')
            .setTitle('Daily Topic')
            .setDescription(selectedTopic)
            .setThumbnail(`attachment://${attachment.name}`)
            .setFooter({ text: '🤖 Assisted by OpenAI' })
            .setTimestamp();

        // Finally, we try to send the embed to the daily topics channel!
        channel.send({ embeds: [embed], files: [attachment] }).then(() => {
            console.log('✅ Daily topic sent successfully.');
        }).catch((error) => {
            console.error('❌ Daily topic failed to send:\n', error);
        });
    });
};