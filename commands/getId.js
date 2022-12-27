const { ApplicationCommandOptionType, CommandInteraction, PermissionFlagsBits } = require("discord.js");
const Country = require("../modules/Country");

module.exports = {
    name: "get-id",
    description: "Permet de récupérer l'id d'un pays.",
    options: [
        {
            name: "name",
            description: "Le nom du pays si ce n'est pas le votre.",
            type: ApplicationCommandOptionType.String,
            required: false
        }],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async (interaction) => {
        const name = interaction.options.getString("name", false);
        const country = name ? Country.getByName(name) : Country.getByMember(interaction.member.id);

        return interaction.reply({ content: `L'id du pays ${country.name}: ${country.id}` });
    }
}