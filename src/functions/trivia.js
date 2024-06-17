const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { giveFruit } = require('../functions/giveFruit');
const { fruitLeaderboard } = require('../functions/fruitLeaderboard');
const { triviaLeaderboard } = require('../functions/triviaLeaderboard');
const fetch = require('node-fetch');
const redis = require('../functions/redis');
const profileSchema = require('../schemas/profiles');

async function trivia(client, stage) {
    if (client === null || client === undefined) {
        console.log('trivia.js: Client object is null/undefined.');
        return;
    }

    const channel = await client.channels.cache.find((channel) => channel.name.includes('trivia') && !channel.name.includes('board'));

    if (!channel) {
        console.log('trivia.js: No channel with "trivia" exists in guild.');
        return;
    }

    switch (stage) {
        case 1: {
            const triviaCategoryMenu = new StringSelectMenuBuilder()
		        .setCustomId('triviaCategoryMenu')
		        .setPlaceholder('Please select...')
		        .addOptions(
			        new StringSelectMenuOptionBuilder()
				        .setLabel('General Knowledge')
				        .setValue('09 General Knowledge'),
			        new StringSelectMenuOptionBuilder()
				        .setLabel('Entertainment: Books')
				        .setValue('10 Entertainment: Books'),
			        /*new StringSelectMenuOptionBuilder()
				        .setLabel('Entertainment: Film')
				        .setValue('11 Entertainment: Film'),*/
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Entertainment: Music')
				        .setValue('12 Entertainment: Music'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Entertainment: Musicals & Theaters')
				        .setValue('13 Entertainment: Musicals & Theaters'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Entertainment: Television')
				        .setValue('14 Entertainment: Television'),
                    /*new StringSelectMenuOptionBuilder()
				        .setLabel('Entertainment: Video Games')
				        .setValue('15 Entertainment: Video Games'),*/
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Entertainment: Board Games')
				        .setValue('16 Entertainment: Board Games'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Science & Nature')
				        .setValue('17 Science & Nature'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Science: Computers')
				        .setValue('18 Science: Computers'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Science: Mathmatics')
				        .setValue('19 Science: Mathmatics'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Mythology')
				        .setValue('20 Mythology'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Sports')
				        .setValue('21 Sports'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Geography')
				        .setValue('22 Geography'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('History')
				        .setValue('23 History'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Politics')
				        .setValue('24 Politics'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Art')
				        .setValue('25 Art'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Celebrities')
				        .setValue('26 Celebrities'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Animals')
				        .setValue('27 Animals'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Vehicles')
				        .setValue('28 Vehicles'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Entertainment: Comics')
				        .setValue('29 Entertainment: Comics'),
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Science: Gadgets')
				        .setValue('30 Science: Gadgets'),
                    /*new StringSelectMenuOptionBuilder()
				        .setLabel('Entertainment: Japanese Anime & Manga')
				        .setValue('31 Entertainment: Japanese Anime & Manga'),*/
                    new StringSelectMenuOptionBuilder()
				        .setLabel('Entertainment: Cartoon & Animations')
				        .setValue('32 Entertainment: Cartoon & Animations')
		        );

            const menuRow = new ActionRowBuilder()
                .addComponents(triviaCategoryMenu);

            const attachment = new AttachmentBuilder('src/images/triviaImage.png', { name: 'triviaImage.png' });

            const message = await channel.send({
                embeds: [new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('🏆 Daily Trivia')
                    .setDescription('Powered by Open Trivia API.')
                    .setThumbnail(`attachment://${attachment.name}`)
                    .addFields(
                        {
                            name: 'Category',
                            value: 'Select a category that you\'d like to see for today\'s Daily Trivia.',
                            inline: true
                        },
                        {
                            name: 'Details',
                            value: 'The category will be picked at random from user selections.',
                            inline: true
                        },
                        {
                            name: 'Start Time',
                            value: `Daily Trivia will begin <t:${Math.floor(Date.now() / 1000 + 900)}:R>.`
                        },
                    )
                ],
                components: [menuRow],
                files: [attachment]
            });

            const collector = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect });

            const selections = [];
            const voters = [];

            collector.on('collect', async (interaction) => {
                if (voters.includes(interaction.user.id)) {
                    interaction.reply({
                        content: 'You have already chosen a category.',
                        ephemeral: true
                    });
                } else {
                    selections.push(interaction.values[0]);
                    voters.push(interaction.user.id);

                    await redis.set(channel.id, JSON.stringify({ category: selections[Math.floor(Math.random() * selections.length)], messageId: message.id }));

                    interaction.reply({
                        content: `You have chosen ${interaction.values[0].slice(3)} as your category and it is now locked in.`,
                        ephemeral: true
                    });
                }
            });
        }

        break;

        case 2: {
            const query = await redis.get(channel.id);

            const difficulties = ['Easy', 'Medium', 'Hard'];
            const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
            let category = 9;
            let categoryLabel = 'General Knowledge';

            if (query) {
                const cache = await JSON.parse(query);
                category = parseInt(cache.category.slice(0, 3));
                categoryLabel = cache.category.slice(3);
                
                try {
                    const message = await channel.messages.fetch(cache.messageId);
                    message.delete();
                } catch (err) {
                    console.log('trivia.js: Category message missing in guild. Skipping.');
                }
            } else {
                console.log('trivia.js: No Redis cache available. Using default configuration.');
            }

            const data = await fetch(`https://opentdb.com/api.php?amount=1&category=${category}&difficulty=${difficulty.toLowerCase()}&type=boolean`).then(res => res.json());
            const question = data.results[0].question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
            const correctAnswer = data.results[0].correct_answer.toString();
            const attachment = new AttachmentBuilder('src/images/triviaImage.png', { name: 'triviaImage.png' });
            let participants = ' ';

            if (!data) {
                channel.send('Daily Trivia API is currently offline. Keep an eye out for it later.');
                return;
            }

            const triviaTrue = new ButtonBuilder()
	            .setCustomId('triviaTrue')
                .setEmoji('👍')
		        .setLabel('True')
		        .setStyle(ButtonStyle.Success);

            const triviaFalse = new ButtonBuilder()
	            .setCustomId('triviaFalse')
                .setEmoji('👎')
		        .setLabel('False')
		        .setStyle(ButtonStyle.Danger);

	        const buttonRow = new ActionRowBuilder()
	            .addComponents(triviaTrue, triviaFalse);

            const embed = new EmbedBuilder()
                embed.setColor('Purple')
                embed.setTitle('🏆 Daily Trivia')
                embed.setDescription('Powered by Open Trivia API.')
                embed.setThumbnail(`attachment://${attachment.name}`)
                embed.addFields(
                    {
                        name: 'Category',
                        value: categoryLabel,
                        inline: true
                    },
                    {
                        name: 'Difficulty',
                        value: difficulty,
                        inline: true
                    },
                    {
                        name: 'Question',
                        value: question
                    },
                    {
                        name: 'End Time',
                        value: `Daily Trivia will end <t:${Math.floor(Date.now() / 1000 + 900)}:R>.`
                    },
                    {
                        name: 'Participants',
                        value: participants
                    }
                )

            const message = await channel.send({
                embeds: [embed],
                components: [buttonRow],
                files: [attachment]
            });

            const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 900000 }); // 15 Minutes (900000ms)

            let usersTrue = [];
            let usersFalse = [];

            collector.on('collect', (interaction) => {
                if (usersTrue.includes(interaction.user.id) || usersFalse.includes(interaction.user.id)) {
                    interaction.reply({
                        content: 'You have already chosen an answer.',
                        ephemeral: true
                    });
                } else {
                    if (interaction.customId === 'triviaTrue') {
                        usersTrue.push(interaction.user.id);
                    }

                    if (interaction.customId === 'triviaFalse') {
                        usersFalse.push(interaction.user.id);
                    }

                    participants += `${interaction.user.displayName}, `;
                    embed.data.fields[4].value = participants.slice(0, -2);

                    message.edit({
                        embeds: [embed],
                        components: [buttonRow],
                        files: [attachment]
                    });

                    interaction.reply({
                        content: `You have chosen ${interaction.customId.replace(/trivia/g, '')} as your answer and it is now locked in.`,
                        ephemeral: true
                    });
                }
            });

            let usersCorrect = [];
            let usersIncorrect = [];
            let correctString = '';
            let incorrectString = '';
            let member;

            collector.on('end', async () => {
                if (correctAnswer.toString() === 'True') {
                    usersTrue.forEach((value) => {
                        member = message.guild.members.cache.find(member => member.id === value);

                        usersCorrect.push(value);
                        correctString += `${member.user.displayName}, `;
                        
                        giveFruit(message.guild.id, null, value, 20);
                    });
    
                    usersFalse.forEach((value) => {
                        member = message.guild.members.cache.find(member => member.id === value);

                        usersIncorrect.push(value);
                        incorrectString += `${member.user.displayName}, `;
                    });
                }

                if (correctAnswer.toString() === 'False') {
                    usersFalse.forEach((value) => {
                        member = message.guild.members.cache.find(member => member.id === value);

                        usersCorrect.push(value);
                        correctString += `${member.user.displayName}, `;

                        giveFruit(message.guild.id, null, value, 20);
                    });
    
                    usersTrue.forEach((value) => {
                        member = message.guild.members.cache.find(member => member.id === value);
                        
                        usersIncorrect.push(value);
                        incorrectString += `${member.user.displayName}, `;
                    });
                }

                try {
                    await message.delete();
                } catch (err) {
                    console.log('trivia.js: Question message missing in guild. Skipping.')
                }

                if (usersCorrect.length === 0 || usersCorrect === undefined) {
                    correctString = 'No user had answered this question correctly...';
                }
    
                if (usersIncorrect.length === 0 || usersIncorrect === undefined) {
                    incorrectString = 'No user had answered this question incorrectly...';
                }

                channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('Purple')
                        .setTitle('🏆 Daily Trivia')
                        .setDescription(`Powered by Open Trivia API.`)
                        .setThumbnail(`attachment://${attachment.name}`)
                        .addFields(
                            {
                                name: 'Category',
                                value: categoryLabel,
                                inline: true
                            },
                            {
                                name: 'Difficulty',
                                value: difficulty,
                                inline: true
                            },
                            {
                                name: 'Question',
                                value: question
                            },
                            {
                                name: 'Details',
                                value: `The correct answer to this question was ${correctAnswer}.`
                            },
                            {
                                name: 'Winners',
                                value: correctString.slice(0, -2)
                            },
                            {
                                name: 'Losers',
                                value: incorrectString.slice(0, -2)
                            }
                        )
                    ],
                    files: [attachment]
                });

                await redis.del(channel.id);

                usersCorrect.forEach(async (value) => {
                    const query = await profileSchema.findOne({ guildId: message.guild.id, userId: value });
    
                    if (!query) {
                        return;
                    }
    
                    const currentStreak = query.triviaStreak;
                    const newStreak = currentStreak + 1;
    
                    await query.updateOne({ triviaStreak: newStreak });
    
                    if (newStreak !== 1) {
                        giveFruit(message.guild.id, null, value, newStreak * 5);
                    }
                });

                usersIncorrect.forEach(async (value) => {
                    const query = await profileSchema.findOne({ guildId: message.guild.id, userId: value });
    
                    if (!query) {
                        return;
                    }
    
                    if (!query.triviaStreak || query.triviaStreak <= 0) {
                        return;
                    }

                    await query.updateOne({ triviaStreak: 0 });
                });

                fruitLeaderboard(message.client);
                triviaLeaderboard(message.client);
            });
        }

        break;
    }
};

module.exports = { trivia };