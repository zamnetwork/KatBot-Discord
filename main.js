const {
    CommandoClient
} = require('discord.js-commando');
const path = require('path');
const argv = require('yargs').argv;

const config = require(path.resolve(__dirname, argv.config || "config.json"));

const client = new CommandoClient({
    commandPrefix: config.prefix,
    unknownCommandResponse: false,
    owner: config.owner,
    disableEveryone: true
});

client.config = config;

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['polls', 'Polls'],
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(config.activity);
});

client.login(config.token);