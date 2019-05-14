const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const oneLine = require('common-tags').oneLine;

module.exports = class VoteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'scale',
            group: 'polls',
            memberName: 'scale',
            description: "Starts a scalar vote.",
            examples: ['!vote "<question>" "<description>" <duration in minutes>'],
            args: [
                {
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
                    key: 'time',
                    prompt: '(Optional) How long should the vote last in minutes?',
                    type: 'integer',
                    default: 0,
                    validate: time => {
                        if (time >= 0 && time <= 10000) return true;
                        return 'Polling time must be between 0 and 10000. (0 means poll never ends)';
                    }
                }
            ]
        });
        // console.log(this.client)
    }

    run(msg, { question, desc, time }) {
        var emojiList = ['1⃣','2⃣','3⃣','4⃣','5⃣'];
        var embed = new RichEmbed()
            .setTitle(question)
            .setDescription(desc)
            .setAuthor(msg.author.username, msg.author.displayAvatarURL)
            .setColor(0x00AE86)
            .setTimestamp();

        if (time) {
            if (time === 1){
                embed.setFooter(`The vote has started and will last 1 minute`)
            }
            else {
                embed.setFooter(`The vote has started and will last ${time} minutes`)
            }
        } else {
            embed.setFooter(`The vote has started and has no end time`)
        }

        msg.delete(); // Remove the user's command message
        msg.channel.send({embed}) // Use a 2d array?
            .then(async (message) => {
                for(let i in emojiList)
                    await message.react(emojiList[i])
                var woah = {}

                console.log("waiting for stuff now...")
                const filter = (reaction, user) => {
                    return user.id != message.author.id;
                };
                const collector = message.createReactionCollector(filter, { time: time*1000 });
                collector.on('collect', (reaction, reactionCollector) => {
                    let users = [...reaction.users];
                    let otherReactions = message.reactions.filter(_=>_.emoji.name!=reaction.emoji.name);
                    otherReactions.forEach(_=>{
                        let removeUser = _.users.find(user=>user.id!=message.author.id&&reaction.users.find(newUser=>user.id==newUser.id))
                        removeUser&&_.remove(removeUser)
                    })

                });
                let desc = []
                collector.on('end', collected => {

                    let colResults = [...collected]

                    emojiList.forEach(emoji=>{
                        let users = colResults.find(e=>e[0]==emoji);
                        users = users ? users[1].users : [];
                        woah[emoji] = [...users].slice(1).map(([id,user])=>({
                            id:user.id, username:user.username
                        }));
                    });

                    message.channel.fetchMessage(message.id)
                    .then(async (message) => {
                        emojiList.forEach(emoji=>{
                            let resultsFor = woah[emoji];
                            desc.push(emoji + ': ' + (resultsFor.length));
                            resultsFor.forEach(user=>{
                                desc.push(user.username+" ("+user.id+")");
                            })
                            desc.push('');
                        });
                        // embed.setDescription('wow')
                        embed.setColor(0xD53C55)
                        if (time === 1){
                            embed.setFooter(`The vote is now closed! It lasted 1 minute`);
                        }
                        else{
                            embed.setFooter(`The vote is now closed! It lasted ${time} minutes`);
                        }
                        embed.setTimestamp();
                        message.edit("", embed);

    this.client.channels.get('577966748813361174').send(desc.join('\n') || 'wowow woah')
                    });

                });


            }).catch(console.error);
    }
};
