const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const client = require('../client')

const axios = require('axios');
const { TWITTER_CONSUMER, TWITTER_BEARER, TWITTER_SECRET } = require('../config.json')

//I know this is horrible but I have nothing else in utils currently... will do better later. 
const twitterChannelLoop = require('../utilities');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('twitter')
        .setDescription('Registers/deletes a Twitter feed.')
        .addStringOption(option => option.setName('handle').setDescription('A Twitter @ or #.').setRequired(true))
        .addStringOption(option => option.setName('arg').setDescription('For dev/admin use.')),

    async execute(interaction) {

        const handle = interaction.options.getString('handle');
        const arg = interaction.options.getString('arg');

        const channelId = interaction.channel.id;

        let messageBody = null;

        let path = 'feeds.json';

        let feeds = JSON.parse(fs.readFileSync(path));
        //subject to refactor
        let handleLoopIds = []

        if (arg === "r") {
            for (c in feeds) {
                console.log("here is a channel: " + c)
                for (u in feeds[c]) {

                    twitterChannelLoop(feeds[c][u], c)
                    console.log("Established feed for " + feeds[c][u])

                }
            }
            messageBody = "Refreshed all Twitter feeds. \n Please ask Dev to restart the bot if there are double messages."
        }
        else {
            let handleList = []

            //create channelId if it does not exist
            if (!feeds[channelId]) { feeds[channelId] = [] }

            handleList = feeds[channelId]

            //remove the handle if it already exists
            if (feeds[channelId].indexOf(handle) > -1) {
                console.log("removing handle")
                const i = feeds[channelId].indexOf(handle);
                feeds[channelId].splice(i, 1);
                try {
                    //subject to refactor

                    clearInterval(handleLoopIds[channelId][handle])
                    const i2 = handleLoopIds.indexOf([channelId][handle]);
                    handleLoopIds[channelId].splice(i2, 1)
                }
                catch {
                    console.log("loop not initialized.")
                }

                messageBody = "Removed user " + handle + " from the Twitter feed."
            }

            //otherwise add the handle to the list
            else {
                console.log("adding handle")
                handleList.push(handle)

                try {
                    let loopId = await twitterChannelLoop(handle, channelId)
                    handleLoopIds.push({ [channelId]: { [handle]: [loopId] } })
                    console.log(handleLoopIds)
                }
                catch (err) {
                    console.log(err)
                }

                messageBody = "Succesfully generated Twitter feed for " + handle;
            }

            feeds = JSON.stringify(feeds)

            //this needs to be writeFileSync in order to allow it to be awaited - Otherwise 'feeds' is redeclared with unfinished json. 

            await fs.writeFileSync(path, feeds, (err) => {
                if (err)
                    console.log(err);
                else {
                    console.log("file written successfully\n");
                }
            });

            feeds = JSON.parse(fs.readFileSync(path));

        }

        await interaction.reply(messageBody);
    },
};