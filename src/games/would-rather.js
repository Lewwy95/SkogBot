const { EmbedBuilder, AttachmentBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { ButtonKit } = require('commandkit');
const redis = require('../config/redis');

// Here we define the selections that will be sent to the games channel - feel free to add or amend!
const selections = [
    { question: 'have all Chickens shrink to the size of Mosquitos or have all Mosquitoes grow to the size of Chickens', answerOne: 'Chickens', answerTwo: 'Mosquitoes' },
    { question: 'skip summer or skip winter every year', answerOne: 'Summer', answerTwo: 'Winter' },
    { question: 'have a personal chef or a personal masseuse', answerOne: 'Chef', answerTwo: 'Masseuse' },
    { question: 'be able to fly or be able to breathe underwater', answerOne: 'Fly', answerTwo: 'Breathe Underwater' },
    { question: 'have a rewind button or a pause button for your life', answerOne: 'Rewind', answerTwo: 'Pause' },
    { question: 'be able to talk to animals or speak all foreign languages', answerOne: 'Animals', answerTwo: 'Languages' },
    { question: 'be able to control fire or water', answerOne: 'Fire', answerTwo: 'Water' },
    { question: 'be able to teleport anywhere or be able to read minds', answerOne: 'Teleport', answerTwo: 'Read Minds' },
    { question: 'be able to control time or space', answerOne: 'Time', answerTwo: 'Space' }
];

module.exports = async (client) => {
    // Check if there is a games channel - if there isn't then we can stop here.
    const channel = client.channels.cache.find(channel => channel.name.includes('daily') && channel.name.includes('game'));
    if (!channel) {
        return;
    }
    
    // Pick a random selection from the selections array.
    let selection = selections[Math.floor(Math.random() * selections.length)];

    // Fetch the would rather blacklist from Redis and parse the data if it exists (if not then we can create it later).
    // This will hopefully prevent the same selection from being sent twice again!
    const query = await redis.get(`${channel.guild.id}_would_rather_blacklist`);
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
        console.error('❌ There are no questions left for would you rather.');
        return;
    }

    // Add the selection to the blacklist.
    data.push(selection.question);
    await redis.set(`${channel.guild.id}_would_rather_blacklist`, JSON.stringify(data));

    // Create a button for users to select answer one.
    const answerOne = new ButtonKit()
        .setEmoji('🅰️')
        .setLabel(selection.answerOne)
        .setStyle(ButtonStyle.Primary)
        .setCustomId('wouldRatherAnswerOne');
    
    // Create a button for users to select answer two.
    const answerTwo = new ButtonKit()
        .setEmoji('🅱️')
        .setLabel(selection.answerTwo)
        .setStyle(ButtonStyle.Primary)
        .setCustomId('wouldRatherAnswerTwo');
    
    // Create a button row with the two buttons.
    const buttonRow = new ActionRowBuilder().addComponents(answerOne, answerTwo);

    // Create an embed with the data selection and buttons.
    const attachment = new AttachmentBuilder('src/images/would-rather.png', { name: 'would-rather.png' });
    const embed = new EmbedBuilder()
        .setColor('Fuchsia')
        .setTitle('Would You Rather')
        .setThumbnail(`attachment://${attachment.name}`)
        .addFields({
            name: 'Question',
            value: `Would you rather ${selection.question}?`
        },
        {
            name: 'Participants',
            value: 'No users have selected an answer yet.',
            inline: true
        },
        {
            name: 'Game Ends',
            value: `<t:${Math.floor(Date.now() / 1000) + 900}:R>`,
            inline: true
        })
        .setFooter({ text: '🤖 Assisted by OpenAI' })
        .setTimestamp();

    // Here we send the embed to the games channel!
    const message = await channel.send({
        content: '@here',
        embeds: [embed],
        components: [buttonRow],
        files: [attachment]
    });

    // Store the message ID in Redis so we can delete it later.
    // We can also end the game if the message is deleted - saving us having to deal with a crash!
    await redis.set(`${channel.guild.id}_would_rather_data`, JSON.stringify({ messageId: message.id }));

    // Create empty arrays to store the participants of the game.
    let participants = [];

    // Here we listen for the button interactions from the user.
    answerOne.onClick(
        async (buttonInteraction) => {
            // Check if the user has already selected an answer - if they have then we can stop here!
            if (participants.some(participant => participant.id === buttonInteraction.user.id)) {
                buttonInteraction.reply({ content: 'You have already selected an answer.', ephemeral: true });
                return;
            }

            // Add the user to the submitters array - this will prevent the user from selecting multiple answers!
            // We then reply to the user with confirmation of their answer!
            participants.push({ id: buttonInteraction.user.id, answer: selection.answerOne });
            buttonInteraction.reply({ content: 'Your selected answer has been submitted.', ephemeral: true });

            // Update the participants field in the original message embed.
            embed.data.fields.find(field => field.name === 'Participants').value = `**${participants.length}** users have selected an answer.`;
            message.edit({ embeds: [embed], components: [buttonRow], files: [attachment] });
        },
        { message, autoReset: false }
    )
    answerTwo.onClick(
        async (buttonInteraction) => {
            // Check if the user has already selected an answer - if they have then we can stop here!
            if (participants.some(participant => participant.id === buttonInteraction.user.id)) {
                buttonInteraction.reply({ content: 'You have already selected an answer.', ephemeral: true });
                return;
            }

            // Add the user to the submitters array - this will prevent the user from selecting multiple answers!
            // We then reply to the user with confirmation of their answer!
            participants.push({ id: buttonInteraction.user.id, answer: selection.answerTwo });
            buttonInteraction.reply({ content: 'Your selected answer has been submitted.', ephemeral: true });

            // Update the participants field in the original message embed.
            embed.data.fields.find(field => field.name === 'Participants').value = `**${participants.length}** users have selected an answer.`;
            message.edit({ embeds: [embed], components: [buttonRow], files: [attachment] });
        },
        { message, time: 900000, autoReset: false }
    )
    .onEnd(async () => {
        // Try to delete the original message once the game is about to end.
        const query = await redis.get(`${channel.guild.id}_would_rather_data`);
        const data = await JSON.parse(query);
        try {
            const message = await channel.messages.fetch(data.messageId);
            message.delete();
        } catch (error) {
            console.error('❌ Would You Rather message missing:\n', error);
        }

        // Delete the would you rather data from Redis as well!
        await redis.del(`${channel.guild.id}_would_rather_data`);

        // Here we fetch the participants of the game and store their data in an array.
        let participantsData = [];
        for (const participant of participants) {
            const user = await channel.client.users.fetch(participant.id);
            participantsData.push({ id: participant.id, name: user.displayName, answer: participant.answer });
        }

        // Count the number of times each answer was selected.
        // We can then determine the most selected answer from the data.
        const answerOneCount = participantsData.filter(participant => participant.answer === selection.answerOne).length;
        const answerTwoCount = participantsData.filter(participant => participant.answer === selection.answerTwo).length;

        // Determine the most selected answer.
        // If both answers were selected the same amount of times then we can set the most selected answer to both.
        let mostSelectedAnswer;
        if (answerOneCount > answerTwoCount) {
            mostSelectedAnswer = selection.answerOne;
        } else if (answerTwoCount > answerOneCount) {
            mostSelectedAnswer = selection.answerTwo;
        } else {
            mostSelectedAnswer = null;
        }

        // Filter the participants into winners and losers based on their answer.
        const winners = participantsData.filter(participant => participant.answer === mostSelectedAnswer);
        const losers = participantsData.filter(participant => participant.answer !== mostSelectedAnswer);

        // Create an embed with the conclusion of the game.
        const attachment = new AttachmentBuilder('src/images/would-rather.png', { name: 'would-rather.png' });
        const embed = new EmbedBuilder()
            .setColor('Fuchsia')
            .setTitle('Would You Rather')
            .setThumbnail(`attachment://${attachment.name}`)
            .addFields({
                name: 'Question',
                value: `Would you rather ${selection.question}?`
            },
            {
                name: 'Winners',
                value: winners.map(winner => `${winner.name} - ${winner.answer}`).join('\n') || 'No winners this time.'
            },
            {
                name: 'Losers',
                value: losers.map(loser => `${loser.name} - ${loser.answer}`).join('\n') || 'No losers this time.'
            },
            {
                name: 'Conclusion',
                value: `The most popular choice was ${mostSelectedAnswer ? `${mostSelectedAnswer}!\nThis choice was picked ${winners.length} time(s).` : 'neither.\nBoth answers were equally selected (or none at all).'}`
            },
            {
                name: 'Participants',
                value: `${participants.length} users participated in this game.`
            })
            .setFooter({ text: '🤖 Assisted by OpenAI' })
            .setTimestamp();

        // Finally, we send the finishing embed to the games channel!
        channel.send({ embeds: [embed], files: [attachment] });
    });
};