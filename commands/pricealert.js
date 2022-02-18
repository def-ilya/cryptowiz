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

        try {
            await token.returnPairs(id).then(res => {
                console.log("Getting pairs")
                network = res[0]['platformId']
                pairAddress = res[0]['pairAddress']
                tokenAddress = res[0]['baseToken']['address']
                baseTokenSymbol = res[0]['baseToken']['symbol']
                quoteTokenSymbol = res[0]['quoteTokenSymbol']
                tokenPrice = res[0]['price']
                console.log("Received pairs")
                if (price <= tokenPrice) { relative = "above" }
                else { relative = "below" }
            })

            const header = `${baseTokenSymbol}-${quoteTokenSymbol} on ${network}\n`
            const middle = `**Price Alert** set for when this pair is ${relative} ${price} USD\n`
            const ending = `\`\`Please verify pair and token address: \nPair: ${pairAddress} \nToken: ${tokenAddress}\`\``

            let loop = setInterval(async () => {
                try {
                    await token.returnPairs(id).then(res => {
                        console.log(`Checking price of ${res[0]['baseToken']['symbol']}`)
                        current = res[0]['price']
                        if (relative === "above" && current < price) {
                            client.users.cache.get('636064055311728661').send('Alert triggered')
                            clearInterval(loop)
                        }
                        else if (current > price) {
                            client.users.cache.get('636064055311728661').send('Alert triggered')
                            clearInterval(loop)
                        }
                    })
                }
                catch {
                    console.log("Skipping loop.")
                }
            }, 2000)

            await interaction.reply(header + middle + ending)
        }
        catch (err) {
            await interaction.reply(`No tokens found! Either try again, or change your search.\n\`\`${err}\`\``)
        }
    },
};