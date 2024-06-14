/*
## DEV NOTES ##
Hey,

I have set up a basic system where a message will be sent to a channel with the name "mind-reader" in it.
If no such channel exists, the game will be skipped. This is so the bot doesn't crash if something goes tits up.

When the message is sent, it will list a random question (as you have kindly set up) with a hidden answer associated with it.
There will be a button at the bottom of the message which users can click on.
Right now the button does nothing, but it will show and use a Modal.
A Modal will allow users to enter an answer and submit it which we can store and grab later.

This is where it gets a bit tricky, you typicall don't handle the Buttons OR Modals in here, but for the sake of my OCD I think we will.
We will use what is called a Collection. If you want to learn more about Buttons, Modals and Collections then I'll link the docs at the bottom.

If you get stuck or want to do it entirely different I won't be offended! Just let me know.

DOCS:
Buttons: https://discordjs.guide/message-components/buttons.html
Modals: https://discordjs.guide/interactions/modals.html
Collectors: https://discordjs.guide/popular-topics/collectors.html#interaction-collectors

Happy coding,
Lewwy
##  ##  ##  ##
*/

// Imports
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js'); // Allows us to use Modals and Buttons
const { ComponentType } = require('discord.js');
const categoryArrays = require('./categoryArrays');
const { ModalSubmitInteraction } = require('discord.js')

// Create this game as a function so we can use the game in any file that we want
// We pass the client as an object here so we can get Discord text channels from it and so on
async function mindReader(client) {
    // Check if the client object that has been passed through by us is valid
    if (client === null || client === undefined) {
        console.log('mindReader.js: Client object is null/undefined.');
        return;
    }

    // Search for and store a text channel with the name "mind-reader" in it
    const channel = await client.channels.cache.find((channel) => channel.name.includes('mindreader'));

    // Check if the channel variable is valid
    if (!channel) {
        console.log('mindReader.js: No channel with "mind-reader" exists in guild.');
        return;
    }

    // All possible questions and answers
    const questions = [ 
        { mainquestion: 'of a country beginning with the letter A', answers: categoryArrays.countryA },
        { mainquestion: 'of a country beginning with the letter B', answers: categoryArrays.countryB },
        { mainquestion: 'of a country beginning with the letter C', answers: categoryArrays.countryC },
        { mainquestion: 'of a country beginning with the letter D', answers: categoryArrays.countryD },
        { mainquestion: 'of a country beginning with the letter E', answers: categoryArrays.countryE },
        { mainquestion: 'of a country beginning with the letter F', answers: categoryArrays.countryF },
        { mainquestion: 'of a country beginning with the letter G', answers: categoryArrays.countryG },
        { mainquestion: 'of a country beginning with the letter H', answers: categoryArrays.countryH },
        { mainquestion: 'of a country beginning with the letter I', answers: categoryArrays.countryI },
        { mainquestion: 'of a country beginning with the letter J', answers: categoryArrays.countryJ },
        { mainquestion: 'of a country beginning with the letter K', answers: categoryArrays.countryK },
        { mainquestion: 'of a country beginning with the letter L', answers: categoryArrays.countryL },
        { mainquestion: 'of a country beginning with the letter M', answers: categoryArrays.countryM },
        { mainquestion: 'of a country beginning with the letter N', answers: categoryArrays.countryN },
        { mainquestion: 'of a country beginning with the letter P', answers: categoryArrays.countryP },
        { mainquestion: 'of a country beginning with the letter R', answers: categoryArrays.countryR },
        { mainquestion: 'of a country beginning with the letter S', answers: categoryArrays.countryS },
        { mainquestion: 'of a country beginning with the letter T', answers: categoryArrays.countryT },
        { mainquestion: 'of a country beginning with the letter U', answers: categoryArrays.countryU },
        { mainquestion: 'of a country beginning with the letter V', answers: categoryArrays.countryV },
        { mainquestion: 'of a country beginning with the letter Z', answers: categoryArrays.countryZ },
        { mainquestion: 'about one of the 10 richest people in history', answers: categoryArrays.richPeople },
        { mainquestion: 'of typical colours of a plain milk chocolate M&M', answers: categoryArrays.mandmColours },
        { mainquestion: 'of an artist who has sold over 40 million copies of an album', answers: categoryArrays.fortymilArtists },
        { mainquestion: 'of one of the 10 Supernatural characters with the most episodes', answers: categoryArrays.spnCharacters },
        { mainquestion: 'of one of the 20 best movies of all time as reviewed by Rotten Tomatoes', answers: categoryArrays.bestMovies },
        { mainquestion: 'of a team that has won the UEFA cup once', answers: categoryArrays.uefaOnce },
        { mainquestion: 'of a team that has won the UEFA cup twice', answers: categoryArrays.uefaTwice },
        { mainquestion: 'of a team that has won the UEFA cup three times', answers: categoryArrays.uefaThrice },
        { mainquestion: 'of a Simpsons character with over 10,000 lines', answers: categoryArrays.simpsons },
        { mainquestion: 'of a game that has won The Game of the Year award from the Game Awards', answers: categoryArrays.gameAward },
        { mainquestion: 'of a playable Elder Scrolls race', answers: categoryArrays.elderScrollsRaces },
        { mainquestion: 'of a planet in our Solar System', answers: categoryArrays.planets }
    ];
    
    // Generate a random question and answer
    const question = questions[Math.floor(Math.random() * questions.length)];
    const skogAnswer = question.answers[Math.floor(Math.random() * question.answers.length)];

    // DEBUG
    //console.log('Name any', question.mainquestion);
    //console.log('Skogs answer:', skogAnswer);

    // Create a Button so users can interact with the game
    const mindReaderButton = new ButtonBuilder()
	    .setCustomId('mindReaderButton')
        .setEmoji('🔍')
		.setLabel('Submit Answer') // The label is the prompt the user sees for this button
		.setStyle(ButtonStyle.Success); // Green

    // Create a Button row and link it to the above button to allow us to attach it to a message
	const mindReaderButtonRow = new ActionRowBuilder()
	    .addComponents(mindReaderButton);

    // Create a Modal so users can interact with the game

    // Create the input element of the Modal so users can type and submit an answer

    // Convert the input element of the Modal into a row to attach to a message we will send later

    // Add the Modal row to the Modal itself

    // Create and send a message to the game's channel
    const message = await channel.send({
        embeds: [new EmbedBuilder()
            .setColor('Purple')
            .setTitle('🧠 Mind Reader')
            .setDescription('Created by satchettin.')
            //.setThumbnail(`attachment://${attachment.name}`) // We can attach a fancy image here later
            .addFields(
                {
                    name: 'Category',
                    value: `Can you think ${question.mainquestion}?`
                },
                {
                    name: 'Details',
                    value: 'Use the button below to provide your answer. If your answer is the same as mine, you lose!'
                }
            )
        ],
        components: [mindReaderButtonRow],
        //files: [attachment] // We can attach a fancy image here later
    });

    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 900000 }); // 15 Minutes (900000ms)

    interaction = ComponentType.Button;
    
    async ({ interaction }) => {
        const mindReaderModal = new ModalBuilder()
		    .setCustomId('mindReaderModal')
		    .setTitle('Mind Reader');

        const mindReaderModalInput = new TextInputBuilder()
            .setCustomId('mindReaderModalInput')
            .setLabel('Please specify...') // The label is the prompt the user sees for this input
            .setStyle(TextInputStyle.Short); // Short means only a single line of text

        const mindReaderModalRow = new ActionRowBuilder().addComponents(mindReaderModalInput);

        mindReaderModal.addComponents(mindReaderModalRow);

        await interaction.showModal(mindReaderModal)
    };

    //collector.on('end', collected => {
        //console.log('Collected ${collected.size} interactions.');
    //});
};

// Export this as a function so we can use the game in any file that we want.
module.exports = { mindReader };