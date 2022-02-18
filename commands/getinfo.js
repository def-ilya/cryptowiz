const { SlashCommandBuilder } = require('@discordjs/builders');
const Token = require('../token');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getinfo')
        .setDescription('Gets info of a token based on ID')
        .addStringOption(option => option.setName('id').setDescription('Enter a token ID.').setRequired(true)),


    async execute(interaction) {

        const id = interaction.options.getString('id');

        const token = new Token(id);
        try {
            const data = await token.getDataById(id).then(async res => {
                if (res['code'] != 404) return res['data']

            });


            const header = `**${data['name']} - ${token.ticker.toUpperCase()}**`
            const priceInfo = `**ATH: ** ${data['market_data']['ath']['usd']} USD\n**Current: **${data['market_data']["current_price"]['usd']} USD`
            const networkAndAddress = () => {
                if (token.network && token.address)
                    return `**Network: **${token.network}\n**Address: **${token.address}`
                else return ""
            }
            const link = () => {
                if (data['links']['homepage'])
                    return `<${data['links']['homepage']}>`
                else return ""
            }

            const messageBody = `${header} \n${priceInfo} \n${networkAndAddress()} \n${link()} `
            await interaction.reply(messageBody.replace(/,/g, ''))
        }
        catch {
            await interaction.reply("No results found!")

        }
    },
};