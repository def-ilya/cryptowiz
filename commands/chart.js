const { SlashCommandBuilder } = require('@discordjs/builders');
const { CHART_IMG_BEARER } = require('../config.json')
const { MessageEmbed, MessageAttachment } = require('discord.js')
const axios = require('axios');
const fs = require('fs');
const download = require('image-downloader')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('chart')
        .setDescription('Displays a chart for a pair.')
        .addStringOption(option => option.setName('id').setDescription('Enter a pair.').setRequired(true))
        .addStringOption((option) =>
            option
                .setName('interval')
                .setDescription('What time interval should the chart show?')
                .addChoices([
                    ['1d', '1d'],
                    ['1M', '1M'],
                    ['3M', '3M'],
                    ['1Y', '1y'],
                    ['5Y', '5y'],
                    ['All', 'all'],
                ])
        )
        .addStringOption((option) =>
            option
                .setName('type')
                .setDescription('Simple or advanced chart?')
                .addChoices([
                    ['Simple', 'mini-chart'],
                    ['Advanced', 'advanced-chart'],
                ])
        ),


    async execute(interaction) {

        const symbol = interaction.options.getString('id');
        let interval = interaction.options.getString('interval');
        let type = interaction.options.getString('type');

        if (interval == null) { interval = "1M" }
        if (type == null) { type = "mini-chart" }

        //api doesn't support macroviews of advanced chart 
        if (type == "advanced-chart") { interval = "1d" }

        console.log(CHART_IMG_BEARER)

        await interaction.deferReply();


        const url = `https://api.chart-img.com/v1/tradingview/${type}?interval=${interval}&height=300&symbol=${symbol}&key=${CHART_IMG_BEARER}`

        console.log(url)

        const img = symbol + "_" + Date.now() + ".png";
        try {
            await download.image({
                url,
                dest: "charts/" + img
            })

            const file = new MessageAttachment('./charts/' + img);

            const embed = new MessageEmbed()
                .setDescription(`${interval}, ${type}`)
                .setTitle(symbol.toUpperCase())
                .setImage('attachment://' + img)
                .setColor('#5468ff');

            await interaction.editReply({ embeds: [embed], files: [file] });
        }
        catch {
            await interaction.reply("Something went wrong... Try again later.")
        }
    },
};