const { SlashCommandBuilder } = require('@discordjs/builders');
const Token = require('../token');
const client = require('../client')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pricealert')
        .setDescription('Sets a price alert.')
        .addStringOption(option => option.setName('id').setDescription('Enter a token ID.').setRequired(true))
        .addNumberOption(option => option.setName('price').setDescription('Enter the threshold price.').setRequired(true)),

    async execute(interaction) {

        const id = interaction.options.getString('id');
        const price = interaction.options.getNumber('price');

        let network, pairAddress, tokenAddress, baseTokenSymbol, quoteTokenSymbol, tokenPrice, relative;

        const token = new Token('btc');

        let sender = await interaction.user.id;


        console.log("Sender is " + sender)
        try {
            await token.returnPairs(id).then(res => {
                console.log("Getting pairs")
                network = res[0]['platformId']
                pairAddress = res[0]['pairAddress']
                tokenAddress = res[0]['baseToken']['address']
                baseTokenSymbol = res[0]['baseToken']['symbol']
                quoteTokenSymbol = res[0]['quoteTokenSymbol']
                tokenPrice = res[0]['priceUsd']
                console.log("Received pairs")
                console.log("price " + price, " tokenPrice: " + tokenPrice)

                //if the price entered as input is greater than the current price, we want an alert when it EXCEEDS the price.
                //if the price entered as input is less than the current price, we want an alert when it goes BELOW the price. 

                if (price > tokenPrice) {
                    console.log("relative set to above")
                    relative = "above"
                }
                if (price < tokenPrice) {
                    console.log("relative set to below")
                    relative = "below"
                }
            })

            const header = `${baseTokenSymbol}-${quoteTokenSymbol} on ${network}\n`
            const middle = `**Price Alert** set for when this pair is ${relative} ${price} USD\n`
            const ending = `\`\`Please verify pair and token address: \nPair: ${pairAddress} \nToken: ${tokenAddress}\`\``


            let loop = setInterval(async () => {
                try {
                    await token.returnPairs(id).then(res => {

                        tokenSymbol = res[0]['baseToken']['symbol'].toUpperCase();
                        console.log(`Checking price of ${tokenSymbol}`)

                        current = res[0]['priceUsd']
                        priceChange = res[0]['h24PriceChange']

                        console.log(current)

                        if ((relative === "above" && current > price) || (relative === "below" && current < price)) {
                            client.users.cache.get(sender).send(`**PRICE ALERT**\n$${tokenSymbol} has gone ${relative} ${price} USD\nCurrent Price: ${current} USD\n24hr Price Change: ${priceChange}%`)
                            clearInterval(loop)
                        }

                    })
                }
                catch (err) {
                    console.log("Skipping loop.")
                    console.log(err)
                }
            }, 5000)

            await interaction.reply(header + middle + ending)
        }
        catch (err) {
            await interaction.reply(`No tokens found! Either try again, or change your search.\n\`\`${err}\`\``)
        }
    },
};