const {
    Command
} = require('discord.js-commando');
const {
    RichEmbed
} = require('discord.js');
const oneLine = require('common-tags').oneLine;

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const Logging = console;
const s3 = new AWS.S3();
const Bucket = 'zam-polls';

function uploadFile({
    key,
    contents,
}) {
    return s3.upload({
            Bucket,
            Key: key,
            Body: Buffer.from(contents),
            ACL: 'public-read',
        })
        .promise()
        .then(r => {
            // Logging.log(r);
            return r;
        })
        .catch(e => {
            Logging.error(e);
            return null;
        });
}

function downloadFile(
    key,
) {
    return s3.getObject({
            Bucket,
            Key: key,
        })
        .promise()
        .then(r => {
            // Logging.log(r);
            return r.Body.toString();
        })
    // .catch(e => {
    //     Logging.error(e);
    //     return null;
    // });
}



async function getState() {

    try {
        let content = await downloadFile(this.client.config.stateFile);
        return JSON.parse(content);
        // return JSON.parse(fs.readFileSync(this.client.config.stateFile).toString());
    } catch (e) {
        console.log(e)
        return {};
    }
}

function saveState(state) {
    fs.writeFileSync(this.client.config.stateFile, JSON.stringify(state, null, 4));
    return uploadFile({
        key: this.client.config.stateFile,
        contents: JSON.stringify(state, null, 4),
    })
}


function startPollReactionCollection(message, emojiList, pollData, author, timeMs) {

    let {
        question,
        desc,
        image,
        checkbox,
        time
    } = pollData;
    console.log("waiting for stuff now...")
    const filter = (reaction, user) => {
        return user.id != message.author.id;
    };
    const collector = message.createReactionCollector(filter, {
        time: timeMs
    });

    var embed = new RichEmbed()
        .setTitle(question)
        .setDescription(desc)
        .setImage(image)
        .setColor(0x00AE86)
        .setTimestamp();

    if (author) {
        embed.setAuthor(author.username, author.displayAvatarURL)
    }

    //

    collector.on('collect', (reaction, reactionCollector) => {
        if (!checkbox) {
            let users = [...reaction.users];
            let otherReactions = message.reactions.filter(_ => _.emoji.name != reaction.emoji.name);
            otherReactions.forEach(_ => {
                let removeUser = _.users.find(user => user.id != message.author.id && reaction.users.find(newUser => user.id == newUser.id))
                removeUser && _.remove(removeUser)
            })
        }
    });


    let ownerId = this.client.config.owner;

    collector.on('end', async collected => {
        message.channel.messages.sweep(otherMessage => otherMessage.id == message.id)
        message = await message.channel.fetchMessage(message.id)
        // console.log("reactions", message.reactions)
        let colResults = [...message.reactions];
        // console.log("colResults", colResults)

        let resultsForGroup = {};

        await Promise.all(emojiList.map(async emoji => {
            let reaction = message.reactions.get(emoji); //colResults.find(result => result[0] == emoji);
            let users = await reaction.fetchUsers();
            // let users = []; //reaction ? reaction[1].users :
            resultsForGroup[emoji] = [...users].filter(([id]) => id != ownerId).map(([id, user]) => ({
                id: user.id,
                username: user.username
            }));
        }));

        let voteData = [
            ['Vote', 'Username', 'User Id']
        ];

        emojiList.forEach((emoji, index) => {
            resultsForGroup[emoji].forEach(user => {
                voteData.push([index, user.username, user.id])
            });
        });



        let resultList = [question, desc]

        emojiList.forEach(emoji => {
            let resultsFor = resultsForGroup[emoji];
            resultList.push(emoji + ': ' + (resultsFor.length));
            resultsFor.forEach(user => {
                resultList.push(user.username + " (" + user.id + ")");
            });
            resultList.push('');
        });
        // embed.setDescription('wow')
        embed.setColor(0xD53C55)
        if (time === 1) {
            embed.setFooter(`The vote is now closed! It lasted 1 hour`);
        } else {
            embed.setFooter(`The vote is now closed! It lasted ${time} hour`);
        }
        embed.setTimestamp();
        message.edit("", embed);
        // console.log("resultsChannel", this.client.config.resultsChannel)
        let channel = this.client.channels.get(this.client.config.resultsChannel);

        await channel.send(resultList.join('\n'));
        await channel.sendFile(Buffer.from(voteData.map(voteEntry => voteEntry.join(',')).join('\n')), 'votes.csv');

        state = await getState.call(this);
        let poll = state.polls.find(pollSearch => pollSearch.messageId == message.id)
        if (poll) {
            poll.sentResults = true;
            saveState.call(this, state);
        }


    });
}

async function runEmoji(msg, pollData, emojiList) {
    // var emojiList = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣'];

    let {
        question,
        desc,
        image,
        checkbox,
        time
    } = pollData;

    let that = this;



    var embed = new RichEmbed()
        .setTitle(question)
        .setDescription(desc)
        .setImage(image)
        .setAuthor(msg.author.username, msg.author.displayAvatarURL)
        .setColor(0x00AE86)
        .setTimestamp();

    if (time) {
        if (time === 1) {
            embed.setFooter(`The vote has started and will last 1 hours`)
        } else {
            embed.setFooter(`The vote has started and will last ${time} hours`)
        }
    } else {
        embed.setFooter(`The vote has started and has no end time`)
    }

    msg.delete(); // Remove the user's command message
    msg.channel.send({
            embed
        }) // Use a 2d array?
        .then(async (message) => {
            for (let i in emojiList)
                await message.react(emojiList[i]);

            let timeMs = parseInt(time * 1000 * 60 * 60);

            state = await getState.call(this);
            state.polls = state.polls || [];
            state.polls.push({
                pollData,
                messageId: message.id,
                channelId: message.channel.id,
                emojiList,
                createdAt: Date.now(),
                author: {
                    username: msg.author.username,
                    displayAvatarURL: msg.author.displayAvatarURL
                },
                timeMs
            });
            saveState.call(this, state);

            startPollReactionCollection.call(this, message, emojiList, pollData, msg.author, timeMs);

        }).catch(console.error);
}

module.exports = {
    getState,
    runEmoji,
    startPollReactionCollection
}