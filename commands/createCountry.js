const { ApplicationCommandOptionType, CommandInteraction, PermissionFlagsBits } = require("discord.js");
const Country = require("../modules/Country");

module.exports = {
    name: "create-country",
    description: "Permet de créer un nouveau pays.",
    options: [{
        name: "name",
        description: "Nom du pays.",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "flag",
        description: "Drapeau du pays.",
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) throw new Error("Vous n'avez pas la permission pour créer un pays !");

        const name = interaction.options.getString("name", true);
        const flag = interaction.options.getString("flag", true);

        const country = await Country.create(name, flag);

        return interaction.reply({ content: `:white_check_mark: Le pays ${country.name} a été créé avec succès !` });
    }
}