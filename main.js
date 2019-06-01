const {
    CommandoClient
} = require('discord.js-commando');
const path = require('path');
const argv = require('yargs').argv;

const config = require(path.resolve(__dirname, argv.config || "config.json"));

const {
    getState,
    runEmoji,
    startPollReactionCollection
} = require('./utils/run-emoji-poll.js');


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

    let state = getState.call({
        client
    });

    let currentPolls = (state.polls || []).filter(poll => (console.log(poll.createdAt + poll.timeMs - Date.now()), poll.createdAt + poll.timeMs > Date.now()));

    currentPolls.forEach(poll => {
        let channel = client.channels.get(poll.channelId);

        channel.fetchMessage(poll.messageId).then(message => {
            console.log("resuming poll")
            startPollReactionCollection(message, poll.pollData, poll.createdAt + poll.timeMs - Date.now())
        })
    })
    //message.channel.fetchMessage(message.id)
    console.log('currentPolls', currentPolls)

});

client.login(config.token);