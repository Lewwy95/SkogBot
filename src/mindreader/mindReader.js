// Imports
const categoryArrays = require('./categoryArrays');

// Create this game as a function so we can use the game in any file that we want.
async function mindReader(client) {
    // This is how we will use your exported arrays.
    // The parent variable is "categoryArrays" as declared at the top under the "Imports" comment.
    // To access a child of that array we use ".richPeople" or ".countryA" or ".mandmColours".
    // Hopefully this helps! Check it out below by running "npm run dev".
    //console.log(`Rich People:\n${categoryArrays.richPeople}\n`);
    //console.log(`Counties with A:\n${categoryArrays.countryA}`);

    // You can also list them plainly like this:
    //console.log(categoryArrays.countryB);

    //const answers = [categoryArrays.richPeople, categoryArrays.countryA];
    //const possAnswers = answers[Math.floor(Math.random()*answers.length)];

    const questions = [{mainquestion: 'of the 10 richest people in history', answers: categoryArrays.richPeople}, 
        {mainquestion: 'country beginning with A', answers: categoryArrays.countryA},
        {mainquestion: 'country beginning with B', answers: categoryArrays.countryB},
        {mainquestion: 'country beginning with C', answers: categoryArrays.countryC},
        {mainquestion: 'country beginning with D', answers: categoryArrays.countryD},
        {mainquestion: 'country beginning with E', answers: categoryArrays.countryE},
        {mainquestion: 'country beginning with F', answers: categoryArrays.countryF},
        {mainquestion: 'country beginning with G', answers: categoryArrays.countryG},
        {mainquestion: 'country beginning with H', answers: categoryArrays.countryH},
        {mainquestion: 'country beginning with I', answers: categoryArrays.countryI},
        {mainquestion: 'country beginning with J', answers: categoryArrays.countryJ},
        {mainquestion: 'country beginning with K', answers: categoryArrays.countryK},
        {mainquestion: 'country beginning with L', answers: categoryArrays.countryL},
        {mainquestion: 'country beginning with M', answers: categoryArrays.countryM},
        {mainquestion: 'country beginning with N', answers: categoryArrays.countryN},
        {mainquestion: 'country beginning with P', answers: categoryArrays.countryP},
        {mainquestion: 'country beginning with R', answers: categoryArrays.countryR},
        {mainquestion: 'country beginning with S', answers: categoryArrays.countryS},
        {mainquestion: 'country beginning with T', answers: categoryArrays.countryT},
        {mainquestion: 'country beginning with U', answers: categoryArrays.countryU},
        {mainquestion: 'country beginning with V', answers: categoryArrays.countryV},
        {mainquestion: 'country beginning with Z', answers: categoryArrays.countryZ},
        {mainquestion: 'typical colours of a plain milk chocolate M&M', answers: categoryArrays.mandmColours},
        {mainquestion: 'artist who has sold over 40 million copies of an album', answers: categoryArrays.fortymilArtists},
        {mainquestion: 'of the 10 Supernatural characters with the most episodes', answers: categoryArrays.spnCharacters},
        {mainquestion: 'of the 20 best movies of all time as reviewed by Rotten Tomatoes', answers: categoryArrays.bestMovies},
        {mainquestion: 'team that has won the UEFA cup once', answers: categoryArrays.uefaOnce},
        {mainquestion: 'team that has won the UEFA cup twice', answers: categoryArrays.uefaTwice},
        {mainquestion: 'team that has won the UEFA cup three times', answers: categoryArrays.uefaThrice},
        {mainquestion: 'Simpsons character with over 10,000 lines', answers: categoryArrays.simpsons},
        {mainquestion: 'game that has won The Game of the Year award from the Game Awards', answers: categoryArrays.gameAward},
        {mainquestion: 'playable Elder Scrolls race', answers: categoryArrays.elderScrollsRaces},
        {mainquestion: 'planet in our Solar System', answers: categoryArrays.planets}];
    
    const question = questions[Math.floor(Math.random()*questions.length)]; //gen random question
    const skogAnswer = question.answers[Math.floor(Math.random()*question.answers.length)]; //gen random answer from within selected question

    console.log('Name any', question.mainquestion); //TESTING ONLY
    console.log('Skogs answer:', skogAnswer); //TESTING ONLY
};

// Export this as a function so we can use the game in any file that we want.
module.exports = { mindReader };0