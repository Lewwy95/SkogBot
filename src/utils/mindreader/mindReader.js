const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, ComponentType } = require('discord.js');
const categoryArrays = require('./categoryArrays');

// MindReader Game
async function mindReader(client) {
    if (client === null || client === undefined) { // Check if the client object is valid
        console.error('Client object is null or undefined.');
        return;
    }

    const channel = await client.channels.cache.find((channel) => channel.name.includes('mind-reader')); // Find the channel with the name "mind-reader" in it

    if (!channel) { // Check if the channel is valid
        console.error('No channel with the name "mind-reader" exists.');
        return;
    }

    const questions = [ // All possible questions and answers
        { questions: 'of a country beginning with the letter A', answers: categoryArrays.countryA },
        { questions: 'of a country beginning with the letter B', answers: categoryArrays.countryB },
        { questions: 'of a country beginning with the letter C', answers: categoryArrays.countryC },
        { questions: 'of a country beginning with the letter D', answers: categoryArrays.countryD },
        { questions: 'of a country beginning with the letter E', answers: categoryArrays.countryE },
        { questions: 'of a country beginning with the letter F', answers: categoryArrays.countryF },
        { questions: 'of a country beginning with the letter G', answers: categoryArrays.countryG },
        { questions: 'of a country beginning with the letter H', answers: categoryArrays.countryH },
        { questions: 'of a country beginning with the letter I', answers: categoryArrays.countryI },
        { questions: 'of a country beginning with the letter J', answers: categoryArrays.countryJ },
        { questions: 'of a country beginning with the letter K', answers: categoryArrays.countryK },
        { questions: 'of a country beginning with the letter L', answers: categoryArrays.countryL },
        { questions: 'of a country beginning with the letter M', answers: categoryArrays.countryM },
        { questions: 'of a country beginning with the letter N', answers: categoryArrays.countryN },
        { questions: 'of a country beginning with the letter P', answers: categoryArrays.countryP },
        { questions: 'of a country beginning with the letter R', answers: categoryArrays.countryR },
        { questions: 'of a country beginning with the letter S', answers: categoryArrays.countryS },
        { questions: 'of a country beginning with the letter T', answers: categoryArrays.countryT },
        { questions: 'of a country beginning with the letter U', answers: categoryArrays.countryU },
        { questions: 'of a country beginning with the letter V', answers: categoryArrays.countryV },
        { questions: 'of a country beginning with the letter Z', answers: categoryArrays.countryZ },
        { questions: 'about one of the 10 richest people in history', answers: categoryArrays.richPeople },
        { questions: 'about one of the typical colours of a plain milk chocolate M&M', answers: categoryArrays.mandmColours },
        { questions: 'of an artist who has sold over 40 million copies of an album', answers: categoryArrays.fortymilArtists },
        { questions: 'of one of the 10 Supernatural characters with the most episodes', answers: categoryArrays.spnCharacters },
        { questions: 'of one of the 20 best movies of all time as reviewed by Rotten Tomatoes', answers: categoryArrays.bestMovies },
        { questions: 'of a team that has won the UEFA cup once', answers: categoryArrays.uefaOnce },
        { questions: 'of a team that has won the UEFA cup twice', answers: categoryArrays.uefaTwice },
        { questions: 'of a team that has won the UEFA cup three times', answers: categoryArrays.uefaThrice },
        { questions: 'of a Simpsons character with over 10,000 lines', answers: categoryArrays.simpsons },
        { questions: 'of a game that has won The Game of the Year award from the Game Awards', answers: categoryArrays.gameAward },
        { questions: 'of a playable Elder Scrolls race', answers: categoryArrays.elderScrollsRaces },
        { questions: 'of a planet in our Solar System', answers: categoryArrays.planets }
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)]; // Select a random question
    const botAnswer = question.answers[Math.floor(Math.random() * question.answers.length)]; // Select a random answer

    const mindReaderButton = new ButtonBuilder() // Create a button so users can interact with the game
	    .setCustomId('mindReaderButton')
        .setEmoji('🔍')
		.setLabel('Submit Answer')
		.setStyle(ButtonStyle.Success); // Green

	const buttonRow = new ActionRowBuilder() // Create a button row and link it to the above button to allow us to attach it to a message
	    .addComponents(mindReaderButton);

    const message = await channel.send({ // Create and send a message to the channel
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('🧠 Mind Reader')
            .setDescription('Created by Satchettin.')
            .addFields(
                {
                    name: 'Category',
                    value: `Can you think ${question.questions}?`
                },
                {
                    name: 'Details',
                    value: 'Use the button below to provide your answer.\nIf your answer is the same as mine then you lose!'
                }
            )
        ],
        components: [buttonRow]
    });

    const mindReaderModal = new ModalBuilder() // Create a modal
        .setCustomId('mindReaderModal')
        .setTitle('Mind Reader');

    const mindReaderModalInput = new TextInputBuilder() // Create an input field so users can input their answer
        .setCustomId('mindReaderModalInput')
        .setLabel('Please specify...')
        .setStyle(TextInputStyle.Short); // Single line of text

    const modalRow = new ActionRowBuilder().addComponents(mindReaderModalInput); // Create a row and link it to the input field
    mindReaderModal.addComponents(modalRow); // Add the row to the modal

    var submitters = []; // Array to store the users who submitted an answer
    var winners = []; // Array to store the winners of the game
    var losers = []; // Array to store the losers of the game

    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 900000 }); // Create a collector to listen for button clicks (900000 = 15 minutes)

    collector.on('collect', async (interaction) => { // Listen for button clicks
        await interaction.showModal(mindReaderModal); // Show the modal when the user clicks the button
        const userSubmitted = await interaction.awaitModalSubmit({ time: 60000, filter: i => i.user.id === interaction.user.id }); // Wait for the user to submit their answer
    
        if (userSubmitted) { // Check if the user submitted an answer
            if (submitters.includes(interaction.user.id)) { // Check if the user has already submitted an answer
                userSubmitted.reply({ content: 'You have already submitted an answer.', ephemeral: true });
                return;
            }

            const userAnswer = userSubmitted.fields.components[0].components[0].value; // Get the user's answer
    
            if (!botAnswer.toLowerCase().includes(userAnswer.toLowerCase())) { // Check if the user's answer is not the same as the bot's answer
                winners.push({ id: interaction.user.id, answer: userAnswer }); // Add the winner's user ID and their answer to the array
            } else {
                losers.push({ id: interaction.user.id, answer: userAnswer }); // Add the loser's user ID and their answer to the array
            }

            submitters.push(interaction.user.id); // Add the user's ID to the array
            userSubmitted.reply({ content: `Thank you for submitting your answer.\n- ${userAnswer}`, ephemeral: true }); // Reply to the user with their answer
        }
    });

    collector.on('end', async () => { // The end of the game when the collector times out
        var winnersData = []; // Array to store the winners' data
        for (const winner of winners) { // Loop through the winners array
            const user = await client.users.fetch(winner.id); // Fetch the user by their ID
            winnersData.push({ id: winner.id, name: user.displayName, answer: winner.answer }); // Store the user's ID and display name
        }

        var losersData = []; // Array to store the losers' data
        for (const loser of losers) { // Loop through the losers array
            const user = await client.users.fetch(loser.id); // Fetch the user by their ID
            losersData.push({ id: loser.id, name: user.displayName, answer: loser.answer }); // Store the user's ID and display name
        }

        await message.delete(); // Delete the original message

        channel.send({ // Send a new message to the channel with the winners and losers
            embeds: [new EmbedBuilder()
                .setColor('Purple')
                .setTitle('🧠 Mind Reader')
                .setDescription('Created by Satchettin.')
                .addFields(
                    {
                        name: 'Category',
                        value: `Can you think ${question.questions}?`
                    },
                    {
                        name: 'Answer',
                        value: `The answer I was thinking of was ${botAnswer}.`
                    },
                    {
                        name: 'Winners',
                        value: winnersData.map(winner => `${winner.name} - ${winner.answer}`).join('\n') || 'No users won this game.'
                    },
                    {
                        name: 'Losers',
                        value: losersData.map(loser => `${loser.name} - ${loser.answer}`).join('\n') || 'No users lost this game.'
                    }
                )
            ]
        });
    });
};

module.exports = mindReader; // Export the function so it can be used in other files