const { ApplicationCommandOptionType, CommandInteraction, PermissionFlagsBits } = require("discord.js");
const Country = require("../modules/Country");

module.exports = {
    name: "edit-country",
    description: "Permet de modifier un pays.",
    options: [
        {
            name: "id",
            description: "ID du pays si ce n'est pas le votre.",
            type: ApplicationCommandOptionType.Number,
            required: false
        },
        {
            name: "name",
            description: "Novueau nom du pays.",
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: "flag",
            description: "Nouveau drapeau du pays.",
            type: ApplicationCommandOptionType.String,
            required: false
        }],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async (interaction) => {
        const id = interaction.options.getNumber("id", false);
        const country = id ? Country.load(id) : Country.getByMember(interaction.member.id);

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !country.members.find(a => a.id === interaction.member.id && a.capacity === "gérant")) throw new Error("Vous n'avez pas la permission pour créer un pays !");

        const name = interaction.options.getString("name", false);
        const flag = interaction.options.getString("flag", false);

        if (!name && !flag) throw new Error("Vous devez spécifier au moins un paramètre !");

        country.name = name || country.name;
        country.flag = flag || country.flag;
        await country.save();

        return interaction.reply({ content: `:white_check_mark: Le pays ${country.name} a été modifié !` });
    }
}