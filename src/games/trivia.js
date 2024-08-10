const { EmbedBuilder, AttachmentBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { ButtonKit } = require('commandkit');
const redis = require('../config/redis');

// Here we define the trivia selections that will be sent to the games channel - feel free to add or amend!
const selections = [
    // Science
    { question: 'What is the largest organ in the human body?', answer: 'Skin', hint: 'It is on the outside of the body.', category: 'Science' },
    { question: 'What is the hardest natural substance on Earth?', answer: 'Diamond', hint: 'It is used in jewelry.', category: 'Science' },
    { question: 'What is the chemical symbol for iron?', answer: 'Fe', hint: 'It is used to make steel.', category: 'Science' },
    { question: 'What is the smallest unit of matter?', answer: 'Atom', hint: 'It is the basic building block of all elements.', category: 'Science' },
    { question: 'What is the process by which plants convert sunlight into energy?', answer: 'Photosynthesis', hint: 'It involves the use of chlorophyll.', category: 'Science' },
    { question: 'What is the study of heredity and letiation in organisms?', answer: 'Genetics', hint: 'It involves the passing of traits from parents to offspring.', category: 'Science' },
    { question: 'What is the force that attracts objects towards each other?', answer: 'Gravity', hint: 'It keeps us grounded on Earth.', category: 'Science' },
    { question: 'What is the unit of electrical resistance?', answer: 'Ohm', hint: 'It is named after a German physicist.', category: 'Science' },
    { question: 'What is the process by which a solid changes directly into a gas?', answer: 'Sublimation', hint: 'It skips the liquid phase.', category: 'Science' },
    { question: 'What is the study of the Earth\'s physical structure and substance?', answer: 'Geology', hint: 'It involves rocks, minerals, and the Earth\'s layers.', category: 'Science' },

    // History
    { question: 'Who was the Iron Lady?', answer: 'Margaret Thatcher', hint: 'She was the Prime Minister of the United Kingdom.', category: 'History' },
    { question: 'Who was the first President of the United States?', answer: 'George Washington', hint: 'He is on the one dollar bill.', category: 'History' },
    { question: 'Who was the first woman to win a Nobel Prize?', answer: 'Marie Curie', hint: 'She was a physicist and chemist.', category: 'History' },
    { question: 'Who was the leader of the Soviet Union during World War II?', answer: 'Joseph Stalin', hint: 'He implemented a series of five-year plans.', category: 'History' },
    { question: 'What year did the United States declare independence from Great Britain?', answer: '1776', hint: 'It is also known as the year of the American Revolution.', category: 'History' },
    { question: 'Who was the first woman to be elected as the Prime Minister of a country?', answer: 'Sirimavo Bandaranaike', hint: 'She was the Prime Minister of Sri Lanka.', category: 'History' },
    { question: 'Who was the first person to step on the moon?', answer: 'Neil Armstrong', hint: 'He said, "That\'s one small step for man, one giant leap for mankind."', category: 'History' },
    { question: 'Who painted the Mona Lisa?', answer: 'Leonardo da Vinci', hint: 'He was an Italian artist and polymath.', category: 'History' },
    { question: 'Who wrote the play "Romeo and Juliet"?', answer: 'William Shakespeare', hint: 'He is often referred to as the greatest writer in the English language.', category: 'History' },
    { question: 'Who was the first person to circumnavigate the globe?', answer: 'Ferdinand Magellan', hint: 'He was a Portuguese explorer.', category: 'History' },
    { question: 'Who was the first woman to fly solo across the Atlantic Ocean?', answer: 'Amelia Earhart', hint: 'She was an American aviator.', category: 'History' },

    // Geography
    { question: 'What is the largest continent in the world?', answer: 'Asia', hint: 'It is the most populous continent.', category: 'Geography' },
    { question: 'What is the longest river in the world?', answer: 'Nile River', hint: 'It is in Africa.', category: 'Geography' },
    { question: 'What is the highest mountain in the world?', answer: 'Mount Everest', hint: 'It is in the Himalayas.', category: 'Geography' },
    { question: 'What is the largest country in South America?', answer: 'Brazil', hint: 'It is known for the Amazon Rainforest.', category: 'Geography' },
    { question: 'What is the largest country in Africa?', answer: 'Algeria', hint: 'It is in North Africa.', category: 'Geography' },
    { question: 'What is the smallest continent in the world?', answer: 'Australia', hint: 'It is also a country.', category: 'Geography' },
    { question: 'What is the largest island in the world?', answer: 'Greenland', hint: 'It is part of Denmark.', category: 'Geography' },
    { question: 'What is the largest country in Europe?', answer: 'Russia', hint: 'It is in Eastern Europe.', category: 'Geography' },
    { question: 'What is the largest country in North America?', answer: 'Canada', hint: 'It is known for maple syrup.', category: 'Geography' },

    // Entertainment
    { question: 'Who is the lead actor in the movie "The Shawshank Redemption"?', answer: 'Tim Robbins', hint: 'He played the character Andy Dufresne.', category: 'Entertainment' },
    { question: 'Which band released the album "Abbey Road"?', answer: 'The Beatles', hint: 'They are considered one of the greatest bands of all time.', category: 'Entertainment' },
    { question: 'Who is the director of the movie "The Godfather"?', answer: 'Francis Ford Coppola', hint: 'He is an American film director and screenwriter.', category: 'Entertainment' },
    { question: 'Which actress won an Academy Award for her role in the movie "La La Land"?', answer: 'Emma Stone', hint: 'She played the character Mia Dolan.', category: 'Entertainment' },
    { question: 'Which TV show features the character Walter White?', answer: 'Breaking Bad', hint: 'It is a critically acclaimed drama series.', category: 'Entertainment' },
    { question: 'Who is the lead singer of the band Coldplay?', answer: 'Chris Martin', hint: 'He is known for his distinctive voice.', category: 'Entertainment' },
    { question: 'Which actress played the character Hermione Granger in the Harry Potter film series?', answer: 'Emma Watson', hint: 'She is a British actress and activist.', category: 'Entertainment' },

    // Sports
    { question: 'Who is the all-time leading scorer in NBA history?', answer: 'Kareem Abdul-Jabbar', hint: 'He played for the Milwaukee Bucks and Los Angeles Lakers.', category: 'Sports' },
    { question: 'Which country has won the most World Cup titles in soccer?', answer: 'Brazil', hint: 'They have won the tournament a record 5 times.', category: 'Sports' },
    { question: 'Who holds the record for the most home runs in a single MLB season?', answer: 'Barry Bonds', hint: 'He hit 73 home runs in the 2001 season.', category: 'Sports' },
    { question: 'Which athlete has won the most Olympic gold medals?', answer: 'Michael Phelps', hint: 'He is a swimmer from the United States.', category: 'Sports' },
    { question: 'Who is the most decorated Olympian of all time?', answer: 'Michael Phelps', hint: 'He has won a total of 28 Olympic medals.', category: 'Sports' },
    { question: 'Which country has won the most medals in the history of the Summer Olympics?', answer: 'United States', hint: 'They have won over 2,500 medals.', category: 'Sports' },
    { question: 'Who is the fastest man in the world?', answer: 'Usain Bolt', hint: 'He holds the world record in the 100m and 200m sprints.', category: 'Sports' },
    { question: 'Which team has won the most Super Bowl titles?', answer: 'New England Patriots', hint: 'They have won the championship 6 times.', category: 'Sports' },
    { question: 'Who is the most successful tennis player of all time?', answer: 'Roger Federer', hint: 'He has won a record 20 Grand Slam singles titles.', category: 'Sports' },
    { question: 'Which country has won the most gold medals in the history of the Winter Olympics?', answer: 'Norway', hint: 'They have won over 300 gold medals.', category: 'Sports' }
];

module.exports = async (client) => {
    // Check if there is a games channel - if there isn't then we can stop here.
    const channel = client.channels.cache.find(channel => channel.name.includes('daily') && channel.name.includes('game'));
    if (!channel) {
        return;
    }
    
    // Pick a random selection from the selections array.
    let selection = selections[Math.floor(Math.random() * selections.length)];

    // Fetch the trivia blacklist from Redis and parse the data if it exists (if not then we can create it later).
    // This will hopefully prevent the same selection from being sent twice again!
    const query = await redis.get(`${channel.guild.id}_trivia_blacklist`);
    let data = [];
    if (query) {
        data = JSON.parse(query);
    }

    // Here we check if the selection is already blacklisted - we'll pick a new one if it is.
    const isBlacklisted = data.includes(selection.question);
    if (isBlacklisted) {
        const nextSelection = selections.filter(element => !data.includes(element.question));
        selection = nextSelection[Math.floor(Math.random() * nextSelection.length)];
    }

    // If there are no selections left to send then we can stop here.
    if (selection === undefined) {
        console.error('❌ There are no trivia questions left.');
        return;
    }

    // Add the selection to the blacklist.
    data.push(selection.question);
    await redis.set(`${channel.guild.id}_trivia_blacklist`, JSON.stringify(data));

    // Create a button for users to submit their answers.
    const submitAnswer = new ButtonKit()
        .setEmoji('👋')
        .setLabel('Submit Answer')
        .setStyle(ButtonStyle.Success)
        .setCustomId('triviaSubmitAnswer');
    
    // Create a button row with the submit answer button.
    const buttonRow = new ActionRowBuilder().addComponents(submitAnswer);

    // Create an embed with the data selection and button.
    const attachment = new AttachmentBuilder('src/images/trivia.png', { name: 'trivia.png' });
    const embed = new EmbedBuilder()
        .setColor('Fuchsia')
        .setTitle('Trivia Game')
        .setThumbnail(`attachment://${attachment.name}`)
        .addFields({
            name: 'Category',
            value: selection.category,
            inline: true
        },
        {
            name: 'Game Ends',
            value: `<t:${Math.floor(Date.now() / 1000) + 900}:R>`,
            inline: true
        },
        {
            name: 'Question',
            value: selection.question
        },
        {
            name: 'Hint',
            value: selection.hint
        },
        {
            name: 'Participants',
            value: 'No users have submitted an answer yet.',
            inline: true
        })
        .setFooter({ text: '🤖 Assisted by OpenAI' })
        .setTimestamp();

    // Here we send the embed to the games channel!
    const message = await channel.send({
        embeds: [embed],
        components: [buttonRow],
        files: [attachment]
    });

    // Store the message ID in Redis so we can delete it later.
    // We can also end the game if the message is deleted - saving us having to deal with a crash!
    await redis.set(`${channel.guild.id}_trivia_data`, JSON.stringify({ messageId: message.id }));

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
            const triviaModal = new ModalBuilder()
                .setCustomId(`triviaModal_${buttonInteraction.id}`)
                .setTitle('Trivia');

            // Create an input field for the user to submit their answer.
            const triviaModalInput = new TextInputBuilder()
                .setCustomId('triviaModalInput')
                .setLabel('Please specify...')
                .setStyle(TextInputStyle.Short);

            // Create a row and link it to the input field - this will allow us to attach it to the modal.
            // We then add the row to the modal.
            const modalRow = new ActionRowBuilder().addComponents(triviaModalInput);
            triviaModal.addComponents(modalRow); 

            // Show the modal to the user when they click the button.
            await buttonInteraction.showModal(triviaModal);

            // Here we await the user's submission.
            // If the user doesn't submit an answer within 1 minute then we can stop here.
            const modalInteraction = await buttonInteraction.awaitModalSubmit({
                filter: async (i) => {
                    const filter =
                        i.user.id === buttonInteraction.user.id &&
                        i.customId === `triviaModal_${buttonInteraction.id}`;
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

            // Get the user's answer and remove any punctuation.
            const userAnswer = modalInteraction.fields.components[0].components[0].value;
            const sanitisedUserAnswer = userAnswer.replace(/[^\w\s]/g, '');
        
            // Check if the user's answer is the same as the selection's answer.
            // If it is then we can add the user to the winners array (otherwise we add them to the losers array).
            if (selection.answer.toLowerCase().includes(sanitisedUserAnswer.toLowerCase())) {
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
        const query = await redis.get(`${channel.guild.id}_trivia_data`);
        const data = await JSON.parse(query);
        try {
            const message = await channel.messages.fetch(data.messageId);
            message.delete();
        } catch (error) {
            console.error('❌ Trivia Game message missing:\n', error);
        }

        // Delete the trivia data from Redis as well!
        await redis.del(`${channel.guild.id}_trivia_data`);

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
        const attachment = new AttachmentBuilder('src/images/trivia.png', { name: 'quotes.png' });
        const embed = new EmbedBuilder()
            .setColor('Fuchsia')
            .setTitle('Trivia Game')
            .setThumbnail(`attachment://${attachment.name}`)
            .addFields({
                name: 'Question',
                value: selection.question
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
        channel.send({ content: '@here', embeds: [embed], files: [attachment] });
    });
};