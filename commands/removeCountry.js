const { ApplicationCommandOptionType, CommandInteraction, PermissionFlagsBits } = require("discord.js");
const Country = require("../modules/Country");

module.exports = {
    name: "remove-country",
    description: "Permet de supprimer un pays.",
    options: [
        {
            name: "id",
            description: "ID du pays si ce n'est pas le votre.",
            type: ApplicationCommandOptionType.Number,
            required: false
        }],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async (interaction) => {
        const id = interaction.options.getNumber("id", false);
        const country = id ? Country.load(id) : Country.getByMember(interaction.member.id);
        const name = country.name;

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !country.members.find(a => a.id === interaction.member.id && a.capacity === "gérant")) throw new Error("Vous n'avez pas la permission pour créer un pays !");

        await country.remove();

        return interaction.reply({ content: `:white_check_mark: Le pays ${name} a été supprimé !` });
    }
}