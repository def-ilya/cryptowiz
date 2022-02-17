const { SlashCommandBuilder } = require('@discordjs/builders');
const Token = require('../token');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getprice')
        .setDescription('Gets price of a token based on chain and contract address.')
        .addStringOption(option => option.setName('id').setDescription('Enter a token ID.').setRequired(true)),

    async execute(interaction) {

        const id = interaction.options.getString('id');

        let network, pairAddress, tokenAddress, baseTokenSymbol, quoteTokenSymbol, tokenPrice;

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
            })
            await interaction.reply(`**${baseTokenSymbol}-${quoteTokenSymbol}** on ${network}\n**${tokenPrice}**USD\n`)
        }
        catch (err) {
            await interaction.reply(`No tokens found! Either try again, or change your search.\n\`\`${err}\`\``)
        }
    },
};