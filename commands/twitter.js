const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

const axios = require('axios');
const OAuth = require('oauth');
const { promisify } = require('util')
const { TWITTER_CONSUMER, TWITTER_BEARER, TWITTER_SECRET } = require('../config.json')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('twitter')
        .setDescription('Registers/deletes a Twitter feed.')
        .addStringOption(option => option.setName('handle').setDescription('A Twitter @ or #.').setRequired(true)),

    async execute(interaction) {

        const handle = interaction.options.getString('handle');

        const channelId = interaction.channel.id;

        let path = 'feeds.json';

        let feeds = JSON.parse(fs.readFileSync(path));

        let handleList = []
        try {
            await axios.get(`https://api.twitter.com/2/users/by?usernames=${handle}`, {
                headers: {
                    Authorization: `Bearer ${TWITTER_BEARER}`
                }
            })
                .then(async (res) => {

                    let _id = res['data']['data'][0]['id']
                    console.log(_id)

                    let sentTweet = null;

                    let loop = setInterval(async () => {

                        await axios.get(`https://api.twitter.com/2/users/${_id}/tweets?tweet.fields=created_at&expansions=author_id&user.fields=created_at&max_results=5`, {
                            headers: {
                                Authorization: `Bearer ${TWITTER_BEARER}`
                            }
                        })
                            .then((res) => {

                                try {
                                    lastTweet = res['data']['data'][0]

                                    if (lastTweet['id'] != sentTweet) {

                                        console.log("lastTweet ID is " + lastTweet['id'])
                                        console.log(lastTweet['text']);
                                        sentTweet = lastTweet['id'];
                                    }
                                }
                                catch {
                                    console.log("No tweets found.")
                                }
                            })

                    }, 2000)
                })
        }
        catch (err) {
            console.log("Error - Twitter user doesn't exist?")
        }


        //create channelId if it does not exist
        if (!feeds[channelId]) { feeds[channelId] = [] }

        handleList = feeds[channelId]

        //remove the handle if it already exists
        if (feeds[channelId].indexOf(handle) > -1) {
            console.log("removing handle")
            const i = feeds[channelId].indexOf(handle);
            feeds[channelId].splice(i, 1);
        }

        //otherwise add the handle to the list
        else {
            console.log("adding handle")
            handleList.push(handle)
        }

        console.log(feeds)

        feeds = JSON.stringify(feeds)

        fs.writeFile(path, feeds, (err) => {
            if (err)
                console.log(err);
            else {
                console.log("file written successfully\n");

            }
        });


        let loop = setInterval(() => {

        }, 5000)
        await interaction.reply(channelId);
    },
};