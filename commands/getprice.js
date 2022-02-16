const { SlashCommandBuilder } = require('@discordjs/builders');
const Token = require('../token');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getprice')
        .setDescription('Gets price of a token based on chain and contract address.')
        .addStringOption(option => option.setName('id').setDescription('Enter a token ID.').setRequired(true)),

    async execute(interaction) {

        const id = interaction.options.getString('id');

        const token = new Token(id);
        await token.getDataById(id);
        const requested = await token.currentPrice()

        console.log("called after getprice: " + requested)

        await interaction.reply(`The current price of $${token.ticker.toUpperCase()} is: ${requested} USD`)

    },
};