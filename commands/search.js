const { SlashCommandBuilder } = require('@discordjs/builders');
const Token = require('../token');

module.exports = {
    data: new SlashCommandBuilder()

        .setName('search')
        .setDescription('Searches for a token by either ticker or name.')
        .addStringOption(option => option.setName('phrase').setDescription('Search phrase.').setRequired(true))
        .addStringOption((option) =>
            option
                .setName('type')
                .setDescription('Search by name or ticker?')
                .addChoices([
                    ['Ticker', 'ticker'],
                    ['Name', 'name']
                ])
        ),


    async execute(interaction) {

        const search = interaction.options.getString('phrase');
        const type = interaction.options.getString('type');

        const token = new Token("0x");
        const list = await token.coinList()
        const overflow = 500;
        let excess = 0;


        let messageBody = "**Results:** \n\n"

        if (type == "ticker" || !type) {

            const results = await list['data'].filter(el => el['symbol'].toLowerCase().indexOf(search.toLowerCase()) >= 0);

            if (results.length != 0) {
                for (let i = 0; i < results.length; i++) {
                    let curr = results[i];
                    if (messageBody.length < overflow) messageBody += (`**Name:** ${curr['name']}\n**ID:** ${curr['id']}\n**Symbol:** $${curr['symbol']}\n \n`)
                    else excess++
                }
                if (excess) messageBody += `And ${excess} others. `
            }
        }
        else if (type == "name") {

            const results = await list['data'].filter(el => el['name'].toLowerCase().indexOf(search.toLowerCase()) >= 0);

            if (results.length != 0) {
                for (let i = 0; i < results.length; i++) {
                    let curr = results[i];
                    if (messageBody.length < overflow) messageBody += (`**Name:** ${curr['name']}\n**ID:** ${curr['id']}\n**Symbol:** $${curr['symbol']}\n \n`)
                    else excess++
                }
                if (excess) messageBody += `And ${excess} others. `
            }
        }

        if (messageBody === "**Results:** \n\n") messageBody = "**No results found.**"

        await interaction.reply(messageBody)

    },
};