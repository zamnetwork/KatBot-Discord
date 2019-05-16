const {
    Command
} = require('discord.js-commando');
const {
    RichEmbed
} = require('discord.js');
const oneLine = require('common-tags').oneLine;

module.exports = async function(msg, {
    question,
    desc,
    image,
    checkbox,
    time
}, emojiList) {
    // var emojiList = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣'];
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
                await message.react(emojiList[i])

            console.log("waiting for stuff now...")
            const filter = (reaction, user) => {
                return user.id != message.author.id;
            };
            const collector = message.createReactionCollector(filter, {
                time: parseInt(time * 1000 * 60 * 60)
            });

            if (!checkbox) {
                collector.on('collect', (reaction, reactionCollector) => {
                    let users = [...reaction.users];
                    let otherReactions = message.reactions.filter(_ => _.emoji.name != reaction.emoji.name);
                    otherReactions.forEach(_ => {
                        let removeUser = _.users.find(user => user.id != message.author.id && reaction.users.find(newUser => user.id == newUser.id))
                        removeUser && _.remove(removeUser)
                    })
                });
            }
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

                        let channel = this.client.channels.get(this.client.config.resultsChannel);

                        channel.send(desc.join('\n'));
                        channel.sendFile(Buffer.from(voteData.map(voteEntry => voteEntry.join(',')).join('\n')), 'votes.csv');

                    });

            });


        }).catch(console.error);
}