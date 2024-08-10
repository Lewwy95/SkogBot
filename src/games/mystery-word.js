const { EmbedBuilder, AttachmentBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { ButtonKit } = require('commandkit');
const redis = require('../config/redis');

// Here we define the word selections that will be sent to the games channel - feel free to add or amend!
const selections = [
    // Fruit
    { word: 'Mango', hint: 'This fruit, often enjoyed in smoothies, has a single large seed and is typically sweet when ripe.', category: 'Fruit' },
    { word: 'Pineapple', hint: 'With its crown of spiky leaves, this fruit\'s name suggests a resemblance to another type of plant.', category: 'Fruit' },
    { word: 'Pomegranate', hint: 'The seeds of this fruit are often used in salads and are encased in a thick, leathery skin.', category: 'Fruit' },
    { word: 'Strawberry', hint: 'This small, red fruit is often enjoyed with cream and is known for its sweet flavor.', category: 'Fruit' },
    { word: 'Watermelon', hint: 'This large fruit is mostly water and is often enjoyed in the summer.', category: 'Fruit' },
    { word: 'Banana', hint: 'This fruit is typically yellow and is known for its curved shape and sweet flavor.', category: 'Fruit' },
    { word: 'Grapefruit', hint: 'This large citrus fruit is known for its sour taste and is often enjoyed at breakfast.', category: 'Fruit' },
    { word: 'Blueberry', hint: 'This small, round fruit is often used in baking and is known for its deep blue color.', category: 'Fruit' },
    { word: 'Raspberry', hint: 'This small, red fruit is known for its sweet and tart flavor and is often used in desserts.', category: 'Fruit' },
    { word: 'Blackberry', hint: 'This fruit is known for its dark color and is often used in pies and jams.', category: 'Fruit' },
    { word: 'Cranberry', hint: 'This fruit is known for its tart flavor and is often used in sauces and juices.', category: 'Fruit' },
    { word: 'Kiwi', hint: 'This small, brown fruit has a green interior and is known for its sweet and tangy flavor.', category: 'Fruit' },
    { word: 'Cherry', hint: 'This small, red fruit is known for its sweet flavor and is often used in desserts.', category: 'Fruit' },
    { word: 'Apple', hint: 'This fruit is known for its crisp texture and sweet flavor and is often used in pies and cider.', category: 'Fruit' },
    { word: 'Lemon', hint: 'This citrus fruit is known for its sour taste and is often used in cooking and baking.', category: 'Fruit' },
    { word: 'Orange', hint: 'This citrus fruit is known for its sweet and tangy flavor and is often enjoyed as juice.', category: 'Fruit' },
    { word: 'Pear', hint: 'This fruit is known for its sweet flavor and is often enjoyed fresh or in desserts.', category: 'Fruit' },
    { word: 'Peach', hint: 'This fruit is known for its fuzzy skin and sweet flavor and is often enjoyed fresh or in desserts.', category: 'Fruit' },
    { word: 'Plum', hint: 'This fruit is known for its sweet and tart flavor and is often used in jams and desserts.', category: 'Fruit' },
    { word: 'Grape', hint: 'This small fruit is known for its sweet and juicy flavor and is often enjoyed fresh or in wine.', category: 'Fruit' },
    { word: 'Coconut', hint: 'This fruit has a hard shell and is known for its sweet flavor and versatility in cooking.', category: 'Fruit' },
    { word: 'Mandarin', hint: 'This small citrus fruit is known for its sweet and tangy flavor and is often enjoyed fresh.', category: 'Fruit' },
    { word: 'Apricot', hint: 'This small fruit is known for its sweet flavor and is often used in jams and desserts.', category: 'Fruit' },
    { word: 'Melon', hint: 'This large fruit is known for its sweet flavor and is often enjoyed fresh or in salads.', category: 'Fruit' },
    { word: 'Fig', hint: 'This small fruit is known for its sweet and chewy texture and is often enjoyed fresh or dried.', category: 'Fruit' },
    { word: 'Papaya', hint: 'This large fruit is known for its sweet flavor and is often enjoyed fresh or in smoothies.', category: 'Fruit' },
    { word: 'Passionfruit', hint: 'This fruit is known for its sweet and tangy flavor and is often used in desserts and drinks.', category: 'Fruit' },
    { word: 'Dragonfruit', hint: 'This exotic fruit is known for its vibrant pink skin and white or red flesh with black seeds.', category: 'Fruit' },
    { word: 'Lychee', hint: 'This small fruit is known for its sweet and floral flavor and is often enjoyed fresh or in desserts.', category: 'Fruit' },
    { word: 'Guava', hint: 'This tropical fruit is known for its sweet and tangy flavor and is often enjoyed fresh or in jams.', category: 'Fruit' },

    // Animals
    { word: 'Penguin', hint: 'Despite being a bird, this animal spends a lot of time in water and is known for its distinctive black and white coloration.', category: 'Animals' },
    { word: 'Kangaroo', hint: 'This iconic animal hops as its primary mode of movement and is often associated with the outback.', category: 'Animals' },
    { word: 'Chameleon', hint: 'Famous for its ability to change skin color, this reptile has a tongue that can extend quickly to catch prey.', category: 'Animals' },
    { word: 'Elephant', hint: 'This large mammal has a long trunk, large ears, and tusks, and is known for its intelligence and memory.', category: 'Animals' },
    { word: 'Giraffe', hint: 'This tall mammal has a long neck, spotted coat, and a prehensile tongue that helps it reach leaves in trees.', category: 'Animals' },
    { word: 'Koala', hint: 'This marsupial is known for its fluffy ears, round face, and diet of eucalyptus leaves.', category: 'Animals' },
    { word: 'Panda', hint: 'This bear is known for its distinctive black and white coloration and is native to China.', category: 'Animals' },
    { word: 'Tiger', hint: 'This large cat is known for its striped coat and is a powerful predator in the wild.', category: 'Animals' },
    { word: 'Lion', hint: 'This big cat is known as the "king of the jungle" and is often associated with courage and strength.', category: 'Animals' },
    { word: 'Zebra', hint: 'This striped mammal is known for its distinctive black and white coat and is native to Africa.', category: 'Animals' },
    { word: 'Gorilla', hint: 'This large primate is known for its strength and intelligence and is native to Africa.', category: 'Animals' },
    { word: 'Hippopotamus', hint: 'This large mammal is known for its massive size, barrel-shaped body, and semi-aquatic lifestyle.', category: 'Animals' },
    { word: 'Rhinoceros', hint: 'This large mammal is known for its thick skin, horn, and powerful charge.', category: 'Animals' },
    { word: 'Sloth', hint: 'This slow-moving mammal is known for its relaxed lifestyle and is often found hanging upside down in trees.', category: 'Animals' },
    { word: 'Ostrich', hint: 'This large bird is known for its long neck, powerful legs, and ability to run at high speeds.', category: 'Animals' },
    { word: 'Cheetah', hint: 'This big cat is known for its speed and is one of the fastest land animals in the world.', category: 'Animals' },
    { word: 'Leopard', hint: 'This big cat is known for its spotted coat and is a powerful predator in the wild.', category: 'Animals' },
    { word: 'Hedgehog', hint: 'This small mammal is known for its spiky coat and habit of curling into a ball for protection.', category: 'Animals' },

    // Countries
    { word: 'Japan', hint: 'Known for its Shinto and Buddhist temples, this country\'s technology industry is world-renowned.', category: 'Countries' },
    { word: 'Egypt', hint: 'This country\'s ancient civilization built monumental tombs and has a desert landscape with a famous river.', category: 'Countries' },
    { word: 'Brazil', hint: 'This country\'s Amazon rainforest is one of the most biodiverse places on Earth.', category: 'Countries' },
    { word: 'Australia', hint: 'This country is home to the Great Barrier Reef and is known for its unique wildlife, such as kangaroos and koalas.', category: 'Countries' },
    { word: 'Canada', hint: 'This country is known for its vast wilderness areas, including national parks and forests.', category: 'Countries' },
    { word: 'Russia', hint: 'This country spans two continents and is known for its vast landscapes, including tundra and taiga.', category: 'Countries' },
    { word: 'India', hint: 'This country is known for its diverse culture, including Hinduism and Bollywood.', category: 'Countries' },
    { word: 'China', hint: 'This country is known for its ancient history, including the Great Wall and the Terracotta Army.', category: 'Countries' },
    { word: 'France', hint: 'This country is known for its cuisine, art, and fashion, as well as landmarks like the Eiffel Tower.', category: 'Countries' },
    { word: 'Italy', hint: 'This country is known for its art, architecture, and cuisine, including pasta and pizza.', category: 'Countries' },
    { word: 'Germany', hint: 'This country is known for its beer, sausages, and cars, as well as its history and culture.', category: 'Countries' },
    { word: 'Mexico', hint: 'This country is known for its cuisine, including tacos and tamales, as well as its ancient ruins and beaches.', category: 'Countries' },
    { word: 'Spain', hint: 'This country is known for its flamenco music and dance, as well as its beaches and architecture.', category: 'Countries' },
    { word: 'Argentina', hint: 'This country is known for its tango music and dance, as well as its beef and wine.', category: 'Countries' },
    { word: 'Thailand', hint: 'This country is known for its cuisine, including pad thai and green curry, as well as its beaches and temples.', category: 'Countries' },
    { word: 'Vietnam', hint: 'This country is known for its cuisine, including pho and banh mi, as well as its history and culture.', category: 'Countries' },
    { word: 'Philippines', hint: 'This country is known for its beaches, islands, and cuisine, including adobo and lechon.', category: 'Countries' },
    { word: 'Indonesia', hint: 'This country is known for its diverse culture, including Bali and Java, as well as its cuisine.', category: 'Countries' },
    { word: 'Turkey', hint: 'This country is known for its cuisine, including kebabs and baklava, as well as its history and culture.', category: 'Countries' },
    { word: 'Greece', hint: 'This country is known for its ancient history, including the Acropolis and the Parthenon, as well as its islands and beaches.', category: 'Countries' },
    { word: 'Nigeria', hint: 'This country is known for its diverse culture, including Nollywood and music, as well as its history and cuisine.', category: 'Countries' },
    { word: 'Kenya', hint: 'This country is known for its wildlife, including lions and elephants, as well as its beaches and culture.', category: 'Countries' },
    { word: 'Morocco', hint: 'This country is known for its cuisine, including tagine and couscous, as well as its architecture and culture.', category: 'Countries' },
    { word: 'Iran', hint: 'This country is known for its history, including the Persian Empire and Islamic architecture, as well as its cuisine.', category: 'Countries' },
    { word: 'Iraq', hint: 'This country is known for its ancient history, including Mesopotamia and Babylon, as well as its cuisine.', category: 'Countries' },

    // Movies
    { word: 'Inception', hint: 'A sci-fi film where dreams are manipulated to plant ideas in people\'s minds.', category: 'Movies' },
    { word: 'Titanic', hint: 'A tragic film based on a real-life ocean disaster, involving a massive luxury liner.', category: 'Movies' },
    { word: 'Interstellar', hint: 'A space exploration film that delves into the nature of time and space.', category: 'Movies' },
    { word: 'Avatar', hint: 'A sci-fi film set on a distant planet, where humans interact with the native species.', category: 'Movies' },
    { word: 'Frozen', hint: 'A Disney film about two royal sisters, one of whom has the power to control ice and snow.', category: 'Movies' },
    { word: 'Aladdin', hint: 'A Disney film about a street urchin who finds a magical lamp and is granted three wishes.', category: 'Movies' },
    { word: 'Braveheart', hint: 'A historical drama film about a Scottish warrior who leads a rebellion against English rule.', category: 'Movies' },
    { word: 'Gladiator', hint: 'A historical drama film about a Roman general who seeks revenge against the emperor who betrayed him.', category: 'Movies' },

    // Random Objects
    { word: 'Umbrella', hint: 'A common item used for protection against rain, typically collapsible for easy carrying.', category: 'Random Objects' },
    { word: 'Telescope', hint: 'An optical instrument that helps observe objects in the night sky.', category: 'Random Objects' },
    { word: 'Laptop', hint: 'A portable computer that can be used on the go, typically with a screen and keyboard.', category: 'Random Objects' },
    { word: 'Sunglasses', hint: 'These are worn to protect the eyes from the sun and can come in a variety of styles.', category: 'Random Objects' },
    { word: 'Headphones', hint: 'These are worn over the ears to listen to music or other audio, often with a wire or wireless connection.', category: 'Random Objects' },
    { word: 'Camera', hint: 'A device used to capture images and videos, often with a lens and viewfinder.', category: 'Random Objects' },
    { word: 'Guitar', hint: 'A stringed instrument that is played by strumming or plucking the strings, often used in music.', category: 'Random Objects' },
    { word: 'Bicycle', hint: 'A two-wheeled vehicle that is powered by pedaling, often used for transportation and recreation.', category: 'Random Objects' },
    { word: 'Watch', hint: 'A timekeeping device that is worn on the wrist, often with hands or a digital display.', category: 'Random Objects' },
    { word: 'Television', hint: 'An electronic device used to display images and sound, often used for entertainment.', category: 'Random Objects' },
    { word: 'Microphone', hint: 'A device used to capture sound and amplify it, often used in music and public speaking.', category: 'Random Objects' },
    { word: 'Wallet', hint: 'A small, flat case used to carry money, cards, and other personal items.', category: 'Random Objects' },

    // Video Games
    { word: 'Minecraft', hint: 'A sandbox game where players can build and explore blocky worlds, mine resources, and fight monsters.', category: 'Video Games' },
    { word: 'Fortnite', hint: 'A battle royale game where players fight to be the last one standing, building structures and using weapons.', category: 'Video Games' },
    { word: 'Overwatch', hint: 'A team-based shooter game where players choose from a variety of heroes with unique abilities.', category: 'Video Games' },
    { word: 'Destiny', hint: 'A multiplayer online shooter game with a science fiction setting and role-playing elements.', category: 'Video Games' },
    { word: 'Fallout', hint: 'A post-apocalyptic role-playing game set in a retro-futuristic world.', category: 'Video Games' },
    { word: 'DOOM', hint: 'A first-person shooter game where players battle demons and other supernatural creatures.', category: 'Video Games' },
    { word: 'Portal', hint: 'A puzzle-platform game where players use a portal gun to solve challenges.', category: 'Video Games' },
    { word: 'Bioshock', hint: 'A first-person shooter game set in an underwater city with a dystopian atmosphere.', category: 'Video Games' },
    { word: 'Minecraft', hint: 'A sandbox game where players can build and explore blocky worlds, mine resources, and fight monsters.', category: 'Video Games' },
    { word: 'Fortnite', hint: 'A battle royale game where players fight to be the last one standing, building structures and using weapons.', category: 'Video Games' },

    // Music Genres
    { word: 'Rock', hint: 'A genre of music characterized by electric guitars, drums, and strong rhythms.', category: 'Music Genres' },
    { word: 'Pop', hint: 'A genre of music characterized by catchy melodies, upbeat rhythms, and commercial appeal.', category: 'Music Genres' },
    { word: 'Jazz', hint: 'A genre of music characterized by improvisation, syncopation, and swing rhythms.', category: 'Music Genres' },
    { word: 'Country', hint: 'A genre of music characterized by acoustic instruments, storytelling lyrics, and twangy vocals.', category: 'Music Genres' },
    { word: 'Reggae', hint: 'A genre of music characterized by offbeat rhythms, social commentary, and a laid-back vibe.', category: 'Music Genres' },
    { word: 'Blues', hint: 'A genre of music characterized by soulful vocals, guitar solos, and a 12-bar chord progression.', category: 'Music Genres' },
    { word: 'Electronic', hint: 'A genre of music characterized by synthesizers, drum machines, and digital production techniques.', category: 'Music Genres' },
    { word: 'Metal', hint: 'A genre of music characterized by distorted guitars, aggressive vocals, and heavy rhythms.', category: 'Music Genres' },
    { word: 'Folk', hint: 'A genre of music characterized by acoustic instruments, storytelling lyrics, and traditional melodies.', category: 'Music Genres' },
    { word: 'Punk', hint: 'A genre of music characterized by fast tempos, short songs, and anti-establishment lyrics.', category: 'Music Genres' },
    { word: 'Soul', hint: 'A genre of music characterized by soulful vocals, gospel influences, and emotional performances.', category: 'Music Genres' },
    { word: 'Funk', hint: 'A genre of music characterized by syncopated rhythms, groovy basslines, and brass instruments.', category: 'Music Genres' },
    { word: 'Gospel', hint: 'A genre of music characterized by spiritual lyrics, call-and-response vocals, and uplifting melodies.', category: 'Music Genres' },

    // Carbonated Beverages
    { word: 'Pepsi', hint: 'This soda is known for its sweet and refreshing flavor and is often enjoyed as a cola.', category: 'Carbonated Beverages' },
    { word: 'Sprite', hint: 'This lemon-lime soda is known for its crisp and citrusy flavor and is often enjoyed with a meal.', category: 'Carbonated Beverages' },
    { word: 'Fanta', hint: 'This soda is known for its fruity flavors and bright colors and is often enjoyed as a treat.', category: 'Carbonated Beverages' },
    { word: '7UP', hint: 'This lemon-lime soda is known for its crisp and refreshing flavor and is often enjoyed as a mixer.', category: 'Carbonated Beverages' },

    // Car Manufacturers
    { word: 'Toyota', hint: 'This Japanese car manufacturer is known for its reliable vehicles and hybrid technology.', category: 'Car Manufacturers' },
    { word: 'Ford', hint: 'This American car manufacturer is known for its trucks, SUVs, and muscle cars.', category: 'Car Manufacturers' },
    { word: 'Honda', hint: 'This Japanese car manufacturer is known for its motorcycles, cars, and power equipment.', category: 'Car Manufacturers' },
    { word: 'Chevrolet', hint: 'This American car manufacturer is known for its trucks, SUVs, and sports cars.', category: 'Car Manufacturers' },
    { word: 'Nissan', hint: 'This Japanese car manufacturer is known for its electric vehicles, trucks, and sports cars.', category: 'Car Manufacturers' },
    { word: 'BMW', hint: 'This German car manufacturer is known for its luxury vehicles, motorcycles, and engines.', category: 'Car Manufacturers' },
    { word: 'Audi', hint: 'This German car manufacturer is known for its luxury vehicles, sports cars, and sedans.', category: 'Car Manufacturers' },
    { word: 'Volkswagen', hint: 'This German car manufacturer is known for its compact cars, vans, and SUVs.', category: 'Car Manufacturers' },
    { word: 'Hyundai', hint: 'This South Korean car manufacturer is known for its compact cars, SUVs, and electric vehicles.', category: 'Car Manufacturers' },
    { word: 'Kia', hint: 'This South Korean car manufacturer is known for its compact cars, SUVs, and electric vehicles.', category: 'Car Manufacturers' },
    { word: 'Subaru', hint: 'This Japanese car manufacturer is known for its all-wheel-drive vehicles and boxer engines.', category: 'Car Manufacturers' },
    { word: 'Mazda', hint: 'This Japanese car manufacturer is known for its sporty vehicles, rotary engines, and crossovers.', category: 'Car Manufacturers' },
    { word: 'Lexus', hint: 'This Japanese car manufacturer is known for its luxury vehicles, hybrids, and SUVs.', category: 'Car Manufacturers' },
    { word: 'Infiniti', hint: 'This Japanese car manufacturer is known for its luxury vehicles, sedans, and SUVs.', category: 'Car Manufacturers' },
    { word: 'Acura', hint: 'This Japanese car manufacturer is known for its luxury vehicles, sedans, and SUVs.', category: 'Car Manufacturers' },
    { word: 'Jeep', hint: 'This American car manufacturer is known for its off-road vehicles, SUVs, and trucks.', category: 'Car Manufacturers' }
];

module.exports = async (client) => {
    // Check if there is a games channel - if there isn't then we can stop here.
    const channel = client.channels.cache.find(channel => channel.name.includes('game'));
    if (!channel) {
        return;
    }
    
    // Pick a random selection from the selections array.
    let selection = selections[Math.floor(Math.random() * selections.length)];

    // Fetch the mystery word blacklist from Redis and parse the data if it exists (if not then we can create it later).
    // This will hopefully prevent the same selection from being sent twice again!
    const query = await redis.get(`${channel.guild.id}_mystery_word_blacklist`);
    let data = [];
    if (query) {
        data = JSON.parse(query);
    }

    // Here we check if the selection is already blacklisted - we'll pick a new one if it is.
    const isBlacklisted = data.includes(selection.hint);
    if (isBlacklisted) {
        const nextSelection = selections.filter(element => !data.includes(element.hint));
        selection = nextSelection[Math.floor(Math.random() * nextSelection.length)];
    }

    // If there are no selections left to send then we can stop here.
    if (selection === undefined) {
        console.error('❌ There are no words left for mystery word.');
        return;
    }

    // Add the selection to the blacklist.
    data.push(selection.hint);
    await redis.set(`${channel.guild.id}_mystery_word_blacklist`, JSON.stringify(data));

    // Create a button for users to submit their answers.
    const submitAnswer = new ButtonKit()
        .setEmoji('👋')
        .setLabel('Submit Answer')
        .setStyle(ButtonStyle.Success)
        .setCustomId('mysteryWordSubmitAnswer');
    
    // Create a button row with the submit answer button.
    const buttonRow = new ActionRowBuilder().addComponents(submitAnswer);

    // Create an embed with the data selection and button.
    const attachment = new AttachmentBuilder('src/images/mystery-word.png', { name: 'mystery-word.png' });
    const embed = new EmbedBuilder()
        .setColor('Fuchsia')
        .setTitle('Mystery Word')
        .setThumbnail(`attachment://${attachment.name}`)
        .addFields({
            name: 'Length',
            value: `This word has **${selection.word.length}** characters.`,
            inline: true
        },
        {
            name: 'Game Ends',
            value: `<t:${Math.floor(Date.now() / 1000) + 900}:R>`,
            inline: true
        },
        {
            name: 'Category',
            value: selection.category
        },
        {
            name: 'Hint',
            value: selection.hint
        },
        {
            name: 'Participants',
            value: 'No users have submitted an answer yet.'
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
    await redis.set(`${channel.guild.id}_mystery_word_data`, JSON.stringify({ messageId: message.id }));

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
            const mysteryWordModal = new ModalBuilder()
                .setCustomId(`mysteryWordModal_${buttonInteraction.id}`)
                .setTitle('Mystery Word');

            // Create an input field for the user to submit their answer.
            const mysteryWordModalInput = new TextInputBuilder()
                .setCustomId('mysteryWordModalInput')
                .setLabel('Please specify...')
                .setStyle(TextInputStyle.Short);

            // Create a row and link it to the input field - this will allow us to attach it to the modal.
            // We then add the row to the modal.
            const modalRow = new ActionRowBuilder().addComponents(mysteryWordModalInput);
            mysteryWordModal.addComponents(modalRow); 

            // Show the modal to the user when they click the button.
            await buttonInteraction.showModal(mysteryWordModal);

            // Here we await the user's submission.
            // If the user doesn't submit an answer within 1 minute then we can stop here.
            const modalInteraction = await buttonInteraction.awaitModalSubmit({
                filter: async (i) => {
                    const filter =
                        i.user.id === buttonInteraction.user.id &&
                        i.customId === `mysteryWordModal_${buttonInteraction.id}`;
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
            if (selection.word.toLowerCase().includes(sanitisedUserAnswer.toLowerCase())) {
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
        const query = await redis.get(`${channel.guild.id}_mystery_word_data`);
        const data = await JSON.parse(query);
        try {
            const message = await channel.messages.fetch(data.messageId);
            message.delete();
        } catch (error) {
            console.error('❌ Mystery Word message missing:\n', error);
        }

        // Delete the mystery word data from Redis as well!
        await redis.del(`${channel.guild.id}_mystery_word_data`);

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
        const attachment = new AttachmentBuilder('src/images/mystery-word.png', { name: 'mystery-word.png' });
        const embed = new EmbedBuilder()
            .setColor('Fuchsia')
            .setTitle('Mystery Word')
            .setThumbnail(`attachment://${attachment.name}`)
            .addFields({
                name: 'Hint',
                value: selection.hint
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
                value: `The answer was **${selection.word}**.`,
                inline: true
            },
            {
                name: 'Participants',
                value: `**${participants.length}** users participated in this game.`,
                inline: true
            })
            .setFooter({ text: '🤖 Assisted by OpenAI' })
            .setTimestamp();

        // Finally, we send the finishing embed to the games channel!
        channel.send({ embeds: [embed], files: [attachment] });
    });
};