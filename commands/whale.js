const { SlashCommandBuilder } = require('@discordjs/builders');
const { ZAPPER_API_KEY } = require('../config.json')
const axios = require('axios')
const fs = require('fs');
const { MessageEmbed } = require('discord.js')
const client = require('../client')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whale')
        .setDescription('Tracks a wallet in this channel.')
        .addStringOption(option => option.setName('id').setDescription('Enter a wallet address.').setRequired(true)),


    async execute(interaction) {

        const address = interaction.options.getString('id')
        const channelId = interaction.channel.id;

        const path = 'whales.json'

        const regex = /^0x[a-fA-F0-9]{40}$/

        let whales = JSON.parse(fs.readFileSync(path));

        await interaction.deferReply();

        try {

            if (!regex.test(address)) {
                throw "Not a valid address."
            }

            if (!whales[channelId]) { whales[channelId] = [] }

            if (whales[channelId].indexOf(address) == -1) {
                console.log("adding address")
                whales[channelId].push(address)
            }
            else {
                console.log("removing address")
                whales[channelId].splice(whales[channelId].indexOf(address), 1)
            }


            const whaleWatchLoop = async (address, channel) => {
                let last_txn = "";

                setInterval(async () => {
                    const data = await axios.get(`https://api.zapper.fi/v1/transactions?api_key=${ZAPPER_API_KEY}&addresses[]=${address}`).then(res => { return res['data']['data'] })
                    if (data[0]['hash'] != last_txn) {
                        console.log(data[0])

                        let color = "#00ff00"
                        let direction = "BUY"

                        if (data[0]['direction'] == "outgoing") {
                            color = "ff0000"
                            direction = "SELL"
                        }

                        let amount = data[0]['amount']
                        console.log(amount)
                        const embed = new MessageEmbed()
                            .setColor(color)
                            .setTitle(direction)
                            .setDescription(data[0]['hash'])
                            .addFields(
                                { name: 'TOKEN:', value: data[0]['symbol'], inline: true },
                                { name: 'AMOUNT:', value: amount, inline: true },
                                { name: 'From:', value: data[0]['from'] },
                                { name: 'To:', value: data[0]['destination'] }
                            )
                            .setTimestamp();

                        client.channels.cache.get(channel).send({ embeds: [embed] })
                        last_txn = data[0]['hash']

                    }
                }, 1000)
            }


            whales = JSON.stringify(whales)

            //this needs to be writeFileSync in order to allow it to be awaited - Otherwise 'feeds' is redeclared with unfinished json. 

            await fs.writeFileSync(path, whales, (err) => {
                if (err)
                    console.log(err);
                else {
                    console.log("file written successfully\n");
                }
            });


            // https://api.zapper.fi/v1/transactions?api_key=&addresses[]=0xb9751897452cf1c95df3af7cd96ab11bc4cd3759

            whaleWatchLoop(address, channelId)

            await interaction.editReply("Deployed whale watcher.");

        }
        catch {
            await interaction.editReply("Something went wrong... Invalid address?");

        }
    },
};