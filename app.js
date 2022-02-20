const Token = require('./token')
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { secret } = require('./config.json')
const client = require('./client')


client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}


const commands = [{
    name: 'ping',
    description: 'Replies with Pong!'
}];


const Based = new Token("based-finance");
Based.getDataById("based-finance").then(res => {
    console.log(Based.ticker);
    console.log(Based.name);
    console.log(Based.address);
    console.log(Based.network);
    Based.currentPrice().then(res => { console.log(res) });
});

client.on('ready', async () => {

    console.log("Connected as " + client.user.tag);
    client.user.setActivity("Track coins with /setstatus");



    // List servers the bot is connected to
    // console.log("Servers:")
    // client.guilds.cache.forEach((guild) => {
    //     console.log(" - " + guild.name)

    //     // List all channels
    //     guild.channels.cache.forEach((channel) => {
    //         console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
    //     })

})


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(secret)
