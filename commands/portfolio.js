const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')

const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('portfolio')
        .setDescription('Displays info about a portfolio.')
        .addStringOption(option => option.setName('wallet').setDescription('Enter a wallet address.').setRequired(true))
        .addStringOption(option => option.setName('option').setDescription('Enter args.')),

    async execute(interaction) {

        const wallet = interaction.options.getString('wallet').toLowerCase();
        const args = interaction.options.getString('option');
        try {
            const balance = await axios.get('https://openapi.debank.com/v1/user/total_balance?id=' + wallet)
                .then(res => {
                    return res['data']['total_usd_value'].toFixed(2);
                })
            const protocolData = await axios.get('https://openapi.debank.com/v1/user/simple_protocol_list?id=' + wallet)
                .then(res => {
                    return res['data']
                })

            let protocols = []

            for (i in protocolData) {

                //don't want empty protocols showing up, so we check if the balance is greater than 1 cent
                if (protocolData[i]['net_usd_value'] > 0.01) {
                    protocols.push(
                        { name: protocolData[i]['name'], value: protocolData[i]['net_usd_value'].toFixed(2) + " USD", inline: true }
                    )
                }
            }

            protocols.sort((a, b) => {
                //I use slice here because otherwise the sort doesn't work.
                return b['value'].slice(0, -4) - a['value'].slice(0, -4);
            })

            while ((protocols.length % 3) != 0) {
                protocols.push(
                    { name: "\u200B", value: "\u200B", inline: true }
                )
            }

            console.log(protocols);

            const embed = new MessageEmbed()
                .setColor('#00ff00')
                .setTitle(wallet)
                .setURL('https://debank.com/profile/' + wallet)
                .setDescription("This wallet is worth " + balance + " USD")
                .addFields(protocols)
                .setTimestamp();


            await interaction.reply({ embeds: [embed] });
        }
        catch {
            await interaction.reply("Something went wrong. Check the wallet address.");
        }
        // await interaction.reply("Your portfolio is worth: " + balance + " USD");
    },
};