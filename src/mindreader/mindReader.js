// Imports
const categoryArrays = require('./categoryArrays');

// Create this game as a function so we can use the game in any file that we want.
async function mindReader(client) {
    // This is how we will use your exported arrays.
    // The parent variable is "categoryArrays" as declared at the top under the "Imports" comment.
    // To access a child of that array we use ".richPeople" or ".countryA" or ".mandmColours".
    // Hopefully this helps! Check it out below by running "npm run dev".
    console.log(`Rich People:\n${categoryArrays.richPeople}\n`);
    console.log(`Counties with A:\n${categoryArrays.countryA}`);

    // You can also list them plainly like this:
    console.log(categoryArrays.countryB);
};

// Export this as a function so we can use the game in any file that we want.
module.exports = { mindReader };