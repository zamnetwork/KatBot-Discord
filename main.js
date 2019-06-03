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

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(config.activity);

    let state = await getState.call({
        client
    });

    let currentPolls = (state.polls || []).filter(poll => !poll.sentResults);

    currentPolls.forEach(poll => {
        let channel = client.channels.get(poll.channelId);

        channel.fetchMessage(poll.messageId).then(message => {
            console.log("resuming poll")
            startPollReactionCollection.call({
                client
            }, message, poll.emojiList, poll.pollData, poll.author, Math.max(1, poll.createdAt + poll.timeMs - Date.now()))
        })
    })
    //message.channel.fetchMessage(message.id)
    // console.log('currentPolls', currentPolls)

});

client.login(config.token);