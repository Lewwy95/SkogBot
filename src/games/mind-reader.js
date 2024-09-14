const { EmbedBuilder, AttachmentBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle  } = require('discord.js');
const { ButtonKit } = require('commandkit');
const redis = require('../config/redis');

// Here we define the selections that will be sent to the games channel - feel free to add or amend!
// Thanks to Satchettin for these (and the game of course).
countryE = [
    'East Timor',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'England',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Eswatini',
    'Ethiopia'
];

countryI = [
    'Iceland',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy'
];

countryL = [
    'Laos',
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg'
];

countryU = [
    'Uganda',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Uruguay',
    'Uzbekistan'
];

planets = [
    'Venus',
    'Earth',
    'Mercury',
    'Jupiter',
    'Mars',
    'Saturn',
    'Uranus',
    'Neptune'
];

elderScrollsRaces = [
    'Altmer',
    'Bosmer',
    'Dunmer',
    'Argonian',
    'Khajiit',
    'Redguard',
    'Breton',
    'Orsimer',
    'Nord',
    'Imperial'
];

gameAward = [
    'Dragon Age Inquisition',
    'The Witcher 3 Wild Hunt',
    'Legend of Zelda Breath of the Wild',
    'God of War',
    'Sekiro Shadows Die Twice',
    'The Last of Us Part II',
    'It Takes Two',
    'Elden Ring',
    'Baldurs Gate 3'
];

simpsons = [
    'Homer',
    'Marge',
    'Bart',
    'Lisa',
    'Burns',
    'Moe',
    'Skinner',
    'Flanders',
    'Grampa',
    'Milhouse',
    'Wiggum',
    'Krusty',
    'Nelson',
    'Lenny',
    'Apu',
    'Smithers'
];

uefaOnce = [
    'Anderlecht',
    'Ajax',
    'Manchester United',
    'PSV Eindhoven',
    'Ipswich Town',
    'Leverkusen',
    'Napoli',
    'Bayern',
    'Schalke',
    'Galatasaray',
    'Valencia',
    'CSKA Moskva',
    'Zenit',
    'Shakhtar',
    'Villareal',
    'Atalanta'
];

uefaTwice = [
    'Mönchengladbach',
    'Tottenham',
    'Feyenoord',
    'IFK Göteborg',
    'Real Madrid',
    'Parma',
    'Porto',
    'Chelsea',
    'Eintracht Frankfurt'
];

uefaThrice = [
    'Inter',
    'Liverpool',
    'Juventus',
    'Atlético'
];

bestMovies = [
    'LA Confidential',
    'The Godfather',
    'Seven Samurai',
    'Parasite',
    'Schindlers List',
    'Top Gun Maverick',
    'Toy Story 2',
    'Chinatown',
    'On the Waterfront',
    'The Battle of Algiers',
    'Toy Story',
    'Rear Window',
    'Modern Times',
    'How to Train your Dragon',
    'All About Eve',
    'Spirited Away',
    'Up',
    'The Third Man',
    'Spotlight'
];


spnCharacters = [
    'Sam',
    'Dean',
    'Castiel',
    'Lucifer',
    'Crowley',
    'Bobby',
    'Mary',
    'Jack',
    'Rowena',
    'Arthur'
];

fortymilArtists = [
    'Michael Jackson',
    'AC DC',
    'Whitney Houston',
    'Pink Floyd',
    'Eagles',
    'Meat Loaf',
    'Shania Twain',
    'Fleetwood Mac',
    'Bee Gees'
];

richPeople = [
    'Genghis Khan',
    'Bill Gates',
    'Alan Rufus',
    'Rockefeller',
    'Andrew Carnegie',
    'Joseph Stalin',
    'Akbar I',
    'Shenzong',
    'Augustus Caesar',
    'Mansa Musa'
];

mandmColours = [
    'Red',
    'Orange',
    'Yellow',
    'Blue',
    'Green',
    'Brown'
];

seasons = [ 
    'Spring',
    'Summer',
    'Autumn',
    'Winter'
];

months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

lightsaber = [
    'Blue',
    'Green',
    'Purple',
    'Yellow',
    'Orange',
    'Red',
    'White',
    'Black'
];

baldGatePals = [
    'Astarion',
    'Gale',
    'Karlach',
    'Laezel',
    'Shadowheart',
    'Wyll'
];

bestsellerBook = [
    'A Tale of Two Cities',
    'The Little Prince',
    'The Alchemist',
    'Harry Potter and the Philosphers Stone',
    'And Then There Were None',
    'Dream of the Red Chamber',
    'The Hobbit'
];

popSupermarket = [
    'Aldi',
    'Lidl',
    'Marks and Spencer',
    'Sainsburys',
    'Coop'
];

gtaProtagonist = [
    'Claude',
    'Tony',
    'Huang',
    'Victor',
    'Johnny',
    'Franklin',
    'Luis',
    'Michael',
    'Trevor',
    'CJ',
    'Tommy',
    'Niko'
];

friendsCharacters = [
    'Rachel',
    'Monica',
    'Phoebe',
    'Joey',
    'Chandler',
    'Ross'
];

greatLakes = [
    'Superior',
    'Michigan',
    'Huron',
    'Erie',
    'Ontario'
];

newYorkBoroughs = [
    'Manhattan',
    'Brooklyn',
    'Queens',
    'Bronx',
    'Staten Island'
];

olympicRings = [
    'Blue',
    'Yellow',
    'Black',
    'Green',
    'Red'
];

periodicTable = [
    'Hydrogen',
    'Helium',
    'Lithium',
    'Beryllium',
    'Boron'
];

cardSuits = [
    'Hearts',
    'Diamonds',
    'Clubs',
    'Spades'
];

module.exports = async (client) => {
    // Check if there is a games channel - if there isn't then we can stop here.
    const channel = client.channels.cache.find(channel => channel.name.includes('daily') && channel.name.includes('game'));
    if (!channel) {
        return;
    }
    
    // Pick a random selection from the game arrays.
    const selections = [
        { question: 'a country beginning with the letter E', answers: countryE },
        { question: 'a country beginning with the letter I', answers: countryI },
        { question: 'a country beginning with the letter L', answers: countryL },
        { question: 'a country beginning with the letter U', answers: countryU },
        { question: 'one of the 10 richest people in history', answer: richPeople },
        { question: 'one of the typical colours of a plain milk chocolate M&M', answer: mandmColours },
        { question: 'an artist who has sold over 40 million copies of an album', answer: fortymilArtists },
        { question: 'one of the 10 Supernatural characters with the most episodes', answer: spnCharacters },
        { question: 'one of the 20 best movies of all time as reviewed by Rotten Tomatoes', answer: bestMovies },
        { question: 'a team that has won the UEFA Europa League cup once', answer: uefaOnce },
        { question: 'a team that has won the UEFA Europa League cup twice', answer: uefaTwice },
        { question: 'a team that has won the UEFA Europa League cup three times', answer: uefaThrice },
        { question: 'a Simpsons character with over 10,000 lines', answer: simpsons },
        { question: 'a game that has won The Game of the Year award from the Game Awards', answer: gameAward },
        { question: 'a playable Elder Scrolls race', answer: elderScrollsRaces },
        { question: 'a planet in our Solar System', answer: planets },
        { question: 'a season of the year', answer: seasons },
        { question: 'a month of the year', answer: months },
        { question: 'one of the 8 canon lightsaber colours', answer: lightsaber },
        { question: 'a companion in Baldur\'s Gate 3 who is playable in act 1', answer: baldGatePals },
        { question: 'a book that has sold over 100 million copies', answer: bestsellerBook },
        { question: 'one of the 5 most popular supermarkets in the UK', answer: popSupermarket },
        { question: 'any protagonist of a released Grand Theft Auto game', answer: gtaProtagonist },
        { question: 'any of the main characters from the series Friends', answer: friendsCharacters },
        { question: 'one of the five Great Lakes of North America?', answer: greatLakes },
        { question: 'one of the five official boroughs of New York City?', answer: newYorkBoroughs },
        { question: 'one of the five colours of the Olympic rings?', answer: olympicRings },
        { question: 'one of the first five elements on the periodic table?', answer: periodicTable },
        { question: 'one of the four suits in a standard deck of playing cards?', answer: cardSuits }
    ];
    
    // Pick a random element from the selections array.
    const question = selections[Math.floor(Math.random() * selections.length)];
    const botAnswer = question.answer[Math.floor(Math.random() * question.answer.length)];
    let selection = { question: question.question, botAnswer: botAnswer };

    // Fetch the mind reader blacklist from Redis and parse the data if it exists (if not then we can create it later).
    // This will hopefully prevent the same selection from being sent twice again!
    const query = await redis.get(`${channel.guild.id}_mind_reader_blacklist`);
    let data = [];
    if (query) {
        data = JSON.parse(query);
    }

    // Here we check if the selection is already blacklisted - we'll pick a new one if it is.
    const isBlacklisted = data.includes(selection.question);
    if (isBlacklisted) {
        const filter = selections.filter(element => !data.includes(element.question.question));
        const nextSelection = filter[Math.floor(Math.random() * filter.length)];
        selection = { question: nextSelection.question, botAnswer: nextSelection.answer[Math.floor(Math.random() * nextSelection.answer.length)] };
    }

    // If there are no selections left to send then we can stop here.
    if (selection.question === undefined) {
        channel.send({ content: 'Today\'s game was Mind Reader but there are no more questions left. Please try again tomorrow!' });
        return;
    }

    // Add the selection to the blacklist.
    data.push(selection.question);
    await redis.set(`${channel.guild.id}_mind_reader_blacklist`, JSON.stringify(data));

    // Create a button for users to submit their answers.
    const submitAnswer = new ButtonKit()
        .setEmoji('👋')
        .setLabel('Submit Answer')
        .setStyle(ButtonStyle.Success)
        .setCustomId('mindReaderSubmitAnswer');
    
    // Create a button row with the submit answer button.
    const buttonRow = new ActionRowBuilder().addComponents(submitAnswer);

    // Create an embed with the data selection and button.
    const attachment = new AttachmentBuilder('src/images/mind-reader.png', { name: 'mind-reader.png' });
    const embed = new EmbedBuilder()
        .setColor('Fuchsia')
        .setTitle('Mind Reader')
        .setThumbnail(`attachment://${attachment.name}`)
        .addFields({
            name: 'Question',
            value: `Can you think of ${selection.question}?`
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
        .setFooter({ text: '⭐ Created by Satchettin' })
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
    await redis.set(`${channel.guild.id}_mind_reader_data`, JSON.stringify({ messageId: message.id }));

    // Create empty arrays to store the participants, winners and losers of the game.
    let participants = [];
    let winners = [];
    let losers = [];
    let cheaters = [];

    // Here we listen for the button interactions from the user.
    submitAnswer.onClick(
        async (buttonInteraction) => {
            // Check if the user has already submitted an answer - if they have then we can stop here!
            if (participants.includes(buttonInteraction.user.id)) {
                buttonInteraction.reply({ content: 'You have already submitted an answer.', ephemeral: true });
                return;
            }

            // Create a modal for the user to input their answer.
            const mindReaderModal = new ModalBuilder()
                .setCustomId(`mindReaderModal_${buttonInteraction.id}`)
                .setTitle('Mind Reader');

            // Create an input field for the user to submit their answer.
            const mindReaderModalInput = new TextInputBuilder()
                .setCustomId('mindReaderModalInput')
                .setLabel('Please specify...')
                .setStyle(TextInputStyle.Short);

            // Create a row and link it to the input field - this will allow us to attach it to the modal.
            // We then add the row to the modal.
            const modalRow = new ActionRowBuilder().addComponents(mindReaderModalInput);
            mindReaderModal.addComponents(modalRow); 

            // Show the modal to the user when they click the button.
            await buttonInteraction.showModal(mindReaderModal);

            // Here we await the user's submission.
            // If the user doesn't submit an answer within 1 minute then we can stop here.
            const modalInteraction = await buttonInteraction.awaitModalSubmit({
                filter: async (i) => {
                    const filter =
                        i.user.id === buttonInteraction.user.id &&
                        i.customId === `mindReaderModal_${buttonInteraction.id}`;
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

            // Log the user's answer to the console.
            console.log(`🚨 Mind Reader: ${buttonInteraction.user.displayName} answered ${sanitisedUserAnswer}`);
        
            // Check if the user's answer is the same as the selection's answer.
            // If it is then we can add the user to the losers array (otherwise we add them to the winners array).
            if (sanitisedUserAnswer.toLowerCase().includes(selection.botAnswer.toLowerCase())) {
                losers.push({ id: buttonInteraction.user.id, answer: userAnswer });
            } else {
                winners.push({ id: buttonInteraction.user.id, answer: userAnswer });
            }

            // Check if the user's answer is part of the possible answers.
            // If it isn't then we can add the user to the cheaters array and remove them from the winners array.
            const validAnswer = question.answer.some(answer => answer.toLowerCase().includes(sanitisedUserAnswer.toLowerCase()));
            if (!validAnswer) {
                cheaters.push({ id: buttonInteraction.user.id, answer: userAnswer });
                winners.pop();
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
        const query = await redis.get(`${channel.guild.id}_mind_reader_data`);
        const data = await JSON.parse(query);
        try {
            const message = await channel.messages.fetch(data.messageId);
            message.delete();
        } catch (error) {
            console.error('❌ Mind Reader message missing:\n', error);
        }

        // Delete the mind reader data from Redis as well!
        await redis.del(`${channel.guild.id}_mind_reader_data`);

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

        // Fetch the users who provided an invalid answer and store their data in an array.
        var cheatersData = [];
        for (const cheater of cheaters) {
            const user = await channel.client.users.fetch(cheater.id);
            cheatersData.push({ id: cheater.id, name: user.displayName, answer: cheater.answer });
        }

        // Create an embed with the conclusion of the game.
        const attachment = new AttachmentBuilder('src/images/mind-reader.png', { name: 'mind-reader.png' });
        const embed = new EmbedBuilder()
            .setColor('Fuchsia')
            .setTitle('Mind Reader')
            .setThumbnail(`attachment://${attachment.name}`)
            .addFields({
                name: 'Question',
                value: `Can you think of ${selection.question}?`
            },
            {
                name: 'Winners (Different Answer)',
                value: winnersData.map(winner => `${winner.name} - ${winner.answer}`).join('\n') || 'No winners this time.'
            },
            {
                name: 'Losers (Same Answer)',
                value: losersData.map(loser => `${loser.name} - ${loser.answer}`).join('\n') || 'No losers this time.'
            },
            {
                name: 'Losers (Wrong Answer)',
                value: cheatersData.map(cheater => `${cheater.name} - ${cheater.answer}`).join('\n') || 'No losers this time.'
            },
            {
                name: 'Answer',
                value: `The answer was **${selection.botAnswer}**.`,
                inline: true
            },
            {
                name: 'Participants',
                value: `${participants.length} users participated in this game.`,
                inline: true
            })
            .setFooter({ text: '⭐ Created by Satchettin' })
            .setTimestamp();

        // Finally, we send the finishing embed to the games channel!
        channel.send({ embeds: [embed], files: [attachment] });

        // Log the winners, losers and cheaters to the console.
        console.log(`🚨 Mind Reader winners:`, winners);
        console.log(`🚨 Mind Reader losers:`, losers)
        console.log(`🚨 Mind Reader cheaters:`, cheaters);
    });
};