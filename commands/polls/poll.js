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
            name: 'poll',
            group: 'polls',
            memberName: 'poll',
            description: "Starts a poll vote.",
            examples: ['!poll "<question>" "<description>" "<choices>" <duration in minutes>'],
            args: [{
                    key: 'question',
                    prompt: 'What is the vote question?',
                    type: 'string',
                    validate: question => {
                        if (question.length < 1000 && question.length > 0) return true;
                        return 'Polling questions must be between 0 and 1000 characters in length.';
                    }
                },
                {
                    key: 'desc',
                    prompt: '(Optional) Do you have more details?',
                    type: 'string',
                    default: ' ',
                    validate: desc => {
                        if (desc.length < 1000 && desc.length > 0) return true;
                        return 'Polling questions must be between 0 and 1000 characters in length.';
                    }
                },
                {
                    key: 'choices',
                    prompt: 'Choices for the vote',
                    type: 'string',
                    default: ' ',
                    validate: desc => {
                        if (desc.length < 1000 && desc.length > 0) return true;
                        return 'Polling choice must be between 0 and 1000 characters in length.';
                    }
                },
                {
                    key: 'image',
                    prompt: '(Optional) Do you have more details?',
                    type: 'string',
                    default: ' ',
                    validate: desc => {
                        if (desc.length < 1000 && desc.length > 0) return true;
                        return 'Polling Image must be between 0 and 1000 characters in length.';
                    }
                },
                {
                    key: 'time',
                    prompt: '(Optional) How long should the vote last in hours?',
                    type: 'float',
                    default: 0,
                    validate: time => {
                        if (time >= 0 && time <= 60) return true;
                        return 'Polling time must be between 0 and 60.';
                    }
                }
            ]
        });
        // console.log(this.client)
    }

    run(msg, {
        question,
        desc,
        choices,
        image,
        time
    }) {
        runEmoji.bind(this)(msg, {
            question,
            desc,
            image,
            time
        }, choices.split(' '));
    }
};