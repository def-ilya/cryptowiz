const { SlashCommandBuilder } = require('@discordjs/builders');
const client = require('../client');
const Token = require('../token');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setstatus')
        .setDescription('Sets a status based on network and contract address.')
        .addStringOption(option => option.setName('id').setDescription('Enter the token ID.').setRequired(true)),
    // .addStringOption(option => option.setName('contract').setDescription('Enter a token contract.').setRequired(true)),


    async execute(interaction) {

        let id = interaction.options.getString('id');
        const token = new Token("btc")

        function priceLoop() {
            try { clearInterval(loop) }
            catch { console.log("Loop not established!") }

            loop = setInterval(() => {
                let data = token.dexScreener(network, contract).then(res => {
                    try {
                        let tokenPrice = res['tradingHistory'][0]['priceUsd'];
                        tokenPrice = tokenPrice.slice(0, -2)
                        let tokenName = res['baseTokenSymbol'];
                        console.log(tokenName + " " + tokenPrice)
                        client.user.setActivity(`$${tokenName}: ${tokenPrice} USD`, { type: 'WATCHING' })
                        return res;
                    }
                    catch {
                        console.log("skipped loop!")
                    }
                });
            }, 2000);
        }



        try {
            client.user.setActivity("Getting price!");

            let pair = await token.returnPairs(id).then(res => {
                console.log("Getting pairs")
                network = res[0]['platformId']
                contract = res[0]['pairAddress']
                console.log("Received pairs")
            })

            priceLoop();
            await interaction.reply('Set status!');
        }
        catch (err) {
            console.log(err);
            await interaction.reply('Failed to get pairs: ' + err);

        }

    },
};