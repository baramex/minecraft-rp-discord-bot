require("dotenv").config();
const fs = require("fs");
const { Collection, ActivityType } = require("discord.js");
const client = require("./client");
const { default: axios } = require("axios");
const Country = require("./modules/Country");

/* EVENTS */
client.on("ready", async () => {
    client.guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!client.guild) throw new Error("Invalid guild id.");
    client.guild.members.fetch();

    /* SPLASH COMMANDS */
    client.commands = new Collection();
    await client.application.commands.fetch().catch(console.error);
    fs.readdir("./commands/", (err, files) => {
        if (err) return console.error(err);

        files.forEach(file => {
            if (!file.endsWith(".js")) return;
            let props = require(`./commands/${file}`);

            let c = client.application.commands.cache.find(a => a.name == props.name);
            if (c) {
                client.application.commands.edit(c, { description: props.description, options: props.options || [] }).catch(console.error);
            }
            else {
                client.application.commands.create({
                    name: props.name,
                    description: props.description,
                    options: props.options || []
                }).catch(console.error);
            }

            client.commands.set(props.name, props);
        });

        client.application.commands.cache.forEach(c => {
            if (!client.commands.has(c.name)) c.delete().catch(console.error);
        });
    });


    updateActivity();
    setInterval(updateActivity, 1000 * 60 * 5);

    console.log("Bot ready !");
});

async function updateActivity() {
    const players = await axios.get("https://mcapi.xdefcon.com/server/minecraft.baramex.me/players/json");
    const count = players.data?.players || 0;
    client.user.setActivity({ name: count + " en ligne | " + Country.getAll().length + " pays", type: ActivityType.Watching });
}

/* SPLASH COMMANDS */
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    try {
        if (cmd) await cmd.run(interaction);
    }
    catch (err) {
        console.error("COMMAND ERROR", "Commande name: ", interaction.commandName, "Arguments: ", interaction.options.data.map(a => `${a.name}: ${a.value}`).join(" - "), "Error: ", err);
        if (!interaction.deferred) interaction.reply({ content: ":x: " + (err.message || "Erreur inattendue."), ephemeral: true }).catch(console.error);
        else interaction.editReply({ content: ":x: " + (err.message || "Erreur inattendue."), ephemeral: true }).catch(console.error);
    }
});