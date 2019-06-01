const {
    Command
} = require('discord.js-commando');
const {
    RichEmbed
} = require('discord.js');
const oneLine = require('common-tags').oneLine;

const fs = require('fs');

function getState() {
    try {
        return JSON.parse(fs.readFileSync(this.client.config.stateFile).toString());
    } catch (e) {
        return {};
    }
}

function saveState(state) {
    fs.writeFileSync(this.client.config.stateFile, JSON.stringify(state, null, 4));
}


function startPollReactionCollection(message, pollData, timeMs) {

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

    collector.on('end', collected => {

        let colResults = [...collected];
        let resultsForGroup = {};

        emojiList.forEach(emoji => {
            let users = colResults.find(e => e[0] == emoji);
            users = users ? users[1].users : [];
            resultsForGroup[emoji] = [...users].slice(1).map(([id, user]) => ({
                id: user.id,
                username: user.username
            }));
        });

        let voteData = [
            ['Vote', 'Username', 'User Id']
        ];

        emojiList.forEach((emoji, index) => {
            resultsForGroup[emoji].forEach(user => {
                voteData.push([index, user.username, user.id])
            });
        });


        message.channel.fetchMessage(message.id)
            .then(async (message) => {
                let desc = []

                emojiList.forEach(emoji => {
                    let resultsFor = resultsForGroup[emoji];
                    desc.push(emoji + ': ' + (resultsFor.length));
                    resultsFor.forEach(user => {
                        desc.push(user.username + " (" + user.id + ")");
                    });
                    desc.push('');
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
                console.log("resultsChannel", this.client.config.resultsChannel)
                let channel = this.client.channels.get(this.client.config.resultsChannel);

                channel.send(desc.join('\n'));
                channel.sendFile(Buffer.from(voteData.map(voteEntry => voteEntry.join(',')).join('\n')), 'votes.csv');

            });

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

            state = getState.call(this);
            state.polls = state.polls || [];
            state.polls.push({
                pollData,
                messageId: message.id,
                channelId: message.channel.id,
                emojiList,
                createdAt: Date.now(),
                timeMs
            });
            saveState.call(this, state);

            startPollReactionCollection.call(this, message, pollData, timeMs);

        }).catch(console.error);
}

module.exports = {
    getState,
    runEmoji,
    startPollReactionCollection
}