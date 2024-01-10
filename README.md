## About

SkogBot is a custom Discord bot written by Lewwy.

## Requirements

* Node.js
* NPM

## Installation

Use the package manager NPM to install all dependencies by opening a terminal then typing the following:

```
npm install
```

This project supports multiple .env files by using cross-env. You will need to create a '.rel.env' file in the root of your project as a minimum requirement. This file should follow the following format as an example, but with your OpenAI key, database and token filled in:

```.rel.env
COUNTCOINS=10 # The amount of coins earned when contributing to the counting game (Required)
COUNTCOOLDOWN=900000 # How long a member will be placed on a cooldown for (Required)
COUNTEXTENDEDCOOLDOWNPRICE=500 # How many coins are needed to purchase this functionality (Required)
COUNTMULTIPLIER=1 # Counting game coins earned per correct number will be multiplied by this value (Required)

DATABASE= # MongoDB url (Required)

MEMBERPOINTS=10 # The amount of points a member gains when sending a message (Required)

AIKEY= # Chat-GPT AI key (Required)

TOKEN= # Discord bot token (Required)
```

## Usage

If you have set up the bot using the '.rel.env' file mentioned above, run the following command in a terminal to start it:

```
npm run rel
```

If you are running multiple environmental files, you will need to duplicate the release script in the 'package.json' file and change it to whatever you want. From there, you can use the "npm run" command interchangeably.

## Contributions

Pull requests are welcome. Please open an issue if you have any problems, or create a personal request with your suggested changes.