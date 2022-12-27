require("dotenv").config();
const fs = require("fs");
const { Collection, ActivityType } = require("discord.js");
const client = require("./client");

/* EVENTS */
client.on("ready", () => {
    client.guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!client.guild) throw new Error("Invalid guild id.");
    client.guild.members.fetch();

    /* SPLASH COMMANDS */
    client.commands = new Collection();
    fs.readdir("./commands/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            if (!file.endsWith(".js")) return;
            let props = require(`./commands/${file}`);

            let c = client.guild.commands.cache.find(a => a.name == props.name);
            if (c) {
                client.guild.commands.edit(c, { description: props.description, options: props.options || [] }).catch(console.error);
            }
            else {
                client.guild.commands.create({
                    name: props.name,
                    description: props.description,
                    options: props.options || []
                }).catch(console.error);
            }

            client.commands.set(props.name, props);
        });
    });

    client.user.setActivity({ name: "minecraft.baramex.me", type: ActivityType.Playing })

    console.log("Bot ready !");
});

/* SPLASH COMMANDS */
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    try {
        if (cmd) await cmd.run(interaction);
    }
    catch (err) {
        console.error("COMMAND ERROR", "Commande name: ", interaction.commandName, "Arguments: ", interaction.options.data.map(a => `${a.name}: ${a.value}`).join(" - "), "Error: ", err);
        interaction.reply({ content: ":x: " + (err.message || "Erreur inattendue."), ephemeral: true });
    }
});