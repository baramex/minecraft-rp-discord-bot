const Discord = require("discord.js");
const Intents = Discord.IntentsBitField.Flags;

const client = new Discord.Client({
    intents: [Intents.Guilds, Intents.GuildMembers]
});

client.login(process.env.BOT_TOKEN);

module.exports = client;