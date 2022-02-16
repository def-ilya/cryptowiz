const { SlashCommandBuilder } = require('@discordjs/builders');
const client = require('../client');
const Token = require('../token');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setstatus')
        .setDescription('Sets a status based on network and contract address.')
        .addStringOption(option => option.setName('network').setDescription('Enter the token network.').setRequired(true))
        .addStringOption(option => option.setName('contract').setDescription('Enter a token contract.').setRequired(true)),


    async execute(interaction) {

        let network = interaction.options.getString('network');
        let contract = interaction.options.getString('contract');

        try {

            client.user.setActivity("Set status!");
            const token = new Token("bitcoin")

            console.log("verifying pair address")
            contract = await token.returnPairAddress(network, contract)

            console.log("verified pair address")
            setInterval(() => {
                let data = token.dexScreener(network, contract).then(res => {
                    let tokenPrice = res['tradingHistory'][0]['priceUsd'];
                    tokenPrice = tokenPrice.slice(0, -2)
                    let tokenName = res['baseTokenSymbol'];
                    console.log(tokenName + " " + tokenPrice)
                    client.user.setActivity(`$${tokenName}: ${tokenPrice} USD`, { type: 'WATCHING' })
                    return res;
                });
            }, 1000);

            await interaction.reply('Set status!');
        }
        catch (err) {
            console.log(err);
        }

    },
};