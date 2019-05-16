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
            name: 'mc',
            group: 'polls',
            memberName: 'mc',
            description: "Starts a multi select vote.",
            examples: ['!vote "<question>" "<description>" <duration in minutes>'],
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
                    prompt: 'Do you have more details?',
                    type: 'string',
                    validate: desc => {
                        if (desc.length < 1000 && desc.length > 0) return true;
                        return 'Polling questions must be between 0 and 1000 characters in length.';
                    }
                },
                {
                    key: 'time',
                    prompt: 'How long should the vote last in hours?',
                    type: 'float',
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
        time
    }) {
        runEmoji.bind(this)(msg, {
            question,
            desc,
            time
        }, ['\ud83c\udde6', '\ud83c\udde7', '\ud83c\udde8', '\ud83c\udde9', '\ud83c\uddea']);
    }
};