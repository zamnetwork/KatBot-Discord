const {
    Command
} = require('discord.js-commando');
const {
    RichEmbed
} = require('discord.js');
const oneLine = require('common-tags').oneLine;

const runEmoji = require('../../utils/run-emoji-poll.js');

module.exports = class VoteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'vote',
            group: 'polls',
            memberName: 'vote',
            description: "Starts a yes/no/don't care vote.",
            examples: ['!vote "Do you like to vote?" "I mean who doesn\'t right?!" 5'],
            args: [{
                    key: 'question',
                    prompt: 'What is the vote question?',
                    type: 'string',
                    validate: question => {
                        if (question.length < 1000 && question.length > 0) return true;
                        return 'Polling questions must be between 10 and 100 characters in length.';
                    }
                },
                {
                    key: 'desc',
                    prompt: '(Optional) Do you have more details?',
                    type: 'string',
                    default: ' ',
                    validate: desc => {
                        if (desc.length < 1000 && desc.length > 0) return true;
                        return 'Polling questions must be between 10 and 200 characters in length.';
                    }
                },
                {
                    key: 'time',
                    prompt: '(Optional) How long should the vote last in minutes?',
                    type: 'integer',
                    default: 0,
                    validate: time => {
                        if (time >= 0 && time <= 60) return true;
                        return 'Polling time must be between 0 and 60.';
                    }
                }
            ]
        });
    }

    run(msg, {
        question,
        desc,
        time
    }) {
        runEmoji.bind(this)(msg, {
            question,
            desc,
            time
        }, ['👍', '👎', '🤷']);
    }
};