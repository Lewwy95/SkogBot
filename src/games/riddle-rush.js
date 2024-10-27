const { EmbedBuilder, AttachmentBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { ButtonKit } = require('commandkit');
const redis = require('../config/redis');

// Here we define the riddle selections that will be sent to the games channel - feel free to add or amend!
const selections = [
    { riddle: 'I\'m tall when I\'m young, and I\'m short when I\'m old. What am I?', answer: 'Candle' },
    { riddle: 'What has keys but can\'t open locks?', answer: 'Piano' },
    { riddle: 'What has a head, a tail, is brown, and has no legs?', answer: 'Penny' },
    { riddle: 'What has a neck but no head?', answer: 'Bottle' },
    { riddle: 'What has a thumb and four fingers but is not a hand?', answer: 'Glove' },
    { riddle: 'What has a heart that doesn\'t beat?', answer: 'Artichoke' },
    { riddle: 'What has a face and two hands but no arms or legs?', answer: 'Clock' },
    { riddle: 'What has a bed but never sleeps?', answer: 'River' },
    { riddle: 'What has a bottom at the top?', answer: 'Legs' },
    { riddle: 'What has a ring but no finger?', answer: 'Phone' },
    { riddle: 'What has keys that open no locks, space but no room, and you can enter but not go in?', answer: 'Keyboard' },
    { riddle: 'I am not alive, but I can grow; I don\'t have lungs, but I need air; I don\'t have a mouth, but water kills me. What am I?', answer: 'Fire' },
    { riddle: 'I am full of holes but can still hold water. What am I?', answer: 'Sponge' },
    { riddle: 'I am always in front of you but you cannot see me. What am I?', answer: 'Future' },
    { riddle: 'I am an odd number. Take away one letter and I become even. What number am I?', answer: 'Seven' },
    { riddle: 'What comes once in a minute, twice in a moment, but never in a thousand years?', answer: 'The letter M' },
    { riddle: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', answer: 'An echo' },
    { riddle: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?', answer: 'A map' },
    { riddle: 'The more you take, the more you leave behind. What am I?', answer: 'Footsteps' },
    { riddle: 'I am not alive, but I can die. What am I?', answer: 'A battery' },
    { riddle: 'What can travel around the world while staying in a corner?', answer: 'A stamp' },
    { riddle: 'What has many teeth, but cannot bite?', answer: 'A comb' },
    { riddle: 'What is so fragile that saying its name breaks it?', answer: 'Silence' },
    { riddle: 'What can fill a room but takes up no space?', answer: 'Light' },
    { riddle: 'What has one eye, but can’t see?', answer: 'A needle' },
    { riddle: 'What gets wetter as it dries?', answer: 'A towel' },
    { riddle: 'What has a head, a tail, is silver, but has no body?', answer: 'A coin' },
    { riddle: 'What can you catch, but not throw?', answer: 'A cold' },
    { riddle: 'What has an end but no beginning, a home but no family, and a space without room?', answer: 'A keyboard' },
    { riddle: 'What has a bark, but no bite?', answer: 'A tree' },
    { riddle: 'What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?', answer: 'A river' }
];

module.exports = async (client) => {
    // Check if there is a games channel - if there isn't then we can stop here.
    const channel = client.channels.cache.find(channel => channel.name.includes('daily') && channel.name.includes('game'));
    if (!channel) {
        return;
    }
    
    // Pick a random selection from the selections array.
    let selection = selections[Math.floor(Math.random() * selections.length)];

    // Fetch the riddle rush blacklist from Redis and parse the data if it exists (if not then we can create it later).
    // This will hopefully prevent the same selection from being sent twice again!
    const query = await redis.get(`${channel.guild.id}_riddle_rush_blacklist`);
    let data = [];
    if (query) {
        data = JSON.parse(query);
    }

    // Here we check if the selection is already blacklisted - we'll pick a new one if it is.
    const isBlacklisted = data.includes(selection.riddle);
    if (isBlacklisted) {
        const nextSelection = selections.filter(element => !data.includes(element.riddle));
        selection = nextSelection[Math.floor(Math.random() * nextSelection.length)];
    }

    // If there are no selections left to send then we can stop here.
    if (selection === undefined) {
        channel.send({ content: 'Today\'s game was Riddle Rush but there are no more questions left. Please try again tomorrow!' });
        return;
    }

    // Add the selection to the blacklist.
    data.push(selection.riddle);
    await redis.set(`${channel.guild.id}_riddle_rush_blacklist`, JSON.stringify(data));

    // Create a button for users to submit their answers.
    const submitAnswer = new ButtonKit()
        .setEmoji('👋')
        .setLabel('Submit Answer')
        .setStyle(ButtonStyle.Success)
        .setCustomId('riddleRushSubmitAnswer');
    
    // Create a button row with the submit answer button.
    const buttonRow = new ActionRowBuilder().addComponents(submitAnswer);

    // Create an embed with the data selection and button.
    const attachment = new AttachmentBuilder('src/images/riddle-rush.png', { name: 'riddle-rush.png' });
    const embed = new EmbedBuilder()
        .setColor('Fuchsia')
        .setTitle('Riddle Rush')
        .setThumbnail(`attachment://${attachment.name}`)
        .addFields({
            name: 'Riddle',
            value: selection.riddle
        },
        {
            name: 'Participants',
            value: 'No users have submitted an answer yet.',
            inline: true
        },
        {
            name: 'Game Ends',
            value: `<t:${Math.floor(Date.now() / 1000) + 900}:R>`,
            inline: true
        })
        .setFooter({ text: '🤖 Assisted by OpenAI' })
        .setTimestamp();

    // Find the "games" role in the guild - if the role doesn't exist then we can stop here.
    const role = channel.guild.roles.cache.find(role => role.name.toLowerCase().includes('games'));
    if (!role) {
        console.error('❌ Daily Games role missing.');
        return;
    }

    // Here we send the embed to the games channel!
    const message = await channel.send({
        content: `<@&${role.id}>`,
        embeds: [embed],
        components: [buttonRow],
        files: [attachment]
    });

    // Store the message ID in Redis so we can delete it later.
    // We can also end the game if the message is deleted - saving us having to deal with a crash!
    await redis.set(`${channel.guild.id}_riddle_rush_data`, JSON.stringify({ messageId: message.id }));

    // Create empty arrays to store the participants, winners and losers of the game.
    let participants = [];
    let winners = [];
    let losers = [];

    // Here we listen for the button interactions from the user.
    submitAnswer.onClick(
        async (buttonInteraction) => {
            // Check if the user has already submitted an answer - if they have then we can stop here!
            if (participants.includes(buttonInteraction.user.id)) {
                buttonInteraction.reply({ content: 'You have already submitted an answer.', ephemeral: true });
                return;
            }

            // Create a modal for the user to input their answer.
            const riddleRushModal = new ModalBuilder()
                .setCustomId(`riddleRushModal_${buttonInteraction.id}`)
                .setTitle('Riddle Rush');

            // Create an input field for the user to submit their answer.
            const riddleRushModalInput = new TextInputBuilder()
                .setCustomId('riddleRushModalInput')
                .setLabel('Please specify...')
                .setStyle(TextInputStyle.Short);

            // Create a row and link it to the input field - this will allow us to attach it to the modal.
            // We then add the row to the modal.
            const modalRow = new ActionRowBuilder().addComponents(riddleRushModalInput);
            riddleRushModal.addComponents(modalRow); 

            // Show the modal to the user when they click the button.
            await buttonInteraction.showModal(riddleRushModal);

            // Here we await the user's submission.
            // If the user doesn't submit an answer within 1 minute then we can stop here.
            const modalInteraction = await buttonInteraction.awaitModalSubmit({
                filter: async (i) => {
                    const filter =
                        i.user.id === buttonInteraction.user.id &&
                        i.customId === `riddleRushModal_${buttonInteraction.id}`;
                    if (filter) {
                        await i.deferReply({ ephemeral: true });
                    }
                    return filter;
                },
                time: 60000
            }).catch(() => null);

            // If the user doesn't submit an answer then we can stop here!
            if (!modalInteraction) {
                return;
            }

            // Get the user's answer and remove any punctuation and articles.
            const userAnswer = modalInteraction.fields.components[0].components[0].value;
            const sanitisedUserAnswer = userAnswer.replace(/[^\w\s]/g, '');
        
            // Check if the user's answer is the same as the selection's answer.
            // If it is then we can add the user to the winners array (otherwise we add them to the losers array).
            if (sanitisedUserAnswer.toLowerCase().includes(selection.answer.toLowerCase())) {
                winners.push({ id: buttonInteraction.user.id, answer: userAnswer });
            } else {
                losers.push({ id: buttonInteraction.user.id, answer: userAnswer });
            }

            // Add the user to the submitters array - this will prevent the user from submitting multiple answers!
            // We then reply to the user with confirmation of their answer!
            participants.push(buttonInteraction.user.id);
            modalInteraction.editReply({ content: 'Your answer has been submitted.', ephemeral: true });

            // Update the participants field in the original message embed.
            embed.data.fields.find(field => field.name === 'Participants').value = `**${participants.length}** users have submitted an answer.`;
            message.edit({ embeds: [embed], components: [buttonRow], files: [attachment] });
        },
        { message, time: 900000, autoReset: false }
    )
    .onEnd(async () => {
        // Try to delete the original message once the game is about to end.
        const query = await redis.get(`${channel.guild.id}_riddle_rush_data`);
        const data = await JSON.parse(query);
        try {
            const message = await channel.messages.fetch(data.messageId);
            message.delete();
        } catch (error) {
            console.error('❌ Riddle Rush message missing:\n', error);
        }

        // Delete the riddle rush data from Redis as well!
        await redis.del(`${channel.guild.id}_riddle_rush_data`);

        // Fetch the users who provided the correct answer and store their data in an array.
        let winnersData = [];
        for (const winner of winners) {
            const user = await channel.client.users.fetch(winner.id);
            winnersData.push({ id: winner.id, name: user.displayName, answer: winner.answer });
        }

        // Here we fetch the users who provided a wrong answer and store their data in an array.
        let losersData = [];
        for (const loser of losers) {
            const user = await channel.client.users.fetch(loser.id);
            losersData.push({ id: loser.id, name: user.displayName, answer: loser.answer });
        }

        // Create an embed with the conclusion of the game.
        const attachment = new AttachmentBuilder('src/images/riddle-rush.png', { name: 'riddle-rush.png' });
        const embed = new EmbedBuilder()
            .setColor('Fuchsia')
            .setTitle('Riddle Rush')
            .setThumbnail(`attachment://${attachment.name}`)
            .addFields({
                name: 'Riddle',
                value: selection.riddle
            },
            {
                name: 'Winners',
                value: winnersData.map(winner => `${winner.name} - ${winner.answer}`).join('\n') || 'No winners this time.'
            },
            {
                name: 'Losers',
                value: losersData.map(loser => `${loser.name} - ${loser.answer}`).join('\n') || 'No losers this time.'
            },
            {
                name: 'Answer',
                value: `The answer was **${selection.answer}**.`,
                inline: true
            },
            {
                name: 'Participants',
                value: `${participants.length} users participated in this game.`,
                inline: true
            })
            .setFooter({ text: '🤖 Assisted by OpenAI' })
            .setTimestamp();

        // Finally, we send the finishing embed to the games channel!
        channel.send({ embeds: [embed], files: [attachment] });
    });
};