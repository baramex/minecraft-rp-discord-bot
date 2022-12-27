const { ApplicationCommandOptionType, CommandInteraction, PermissionFlagsBits } = require("discord.js");
const Country = require("../modules/Country");

module.exports = {
    name: "add-member",
    description: "Permet d'ajouter un membre à un pays.",
    options: [
        {
            name: "member",
            description: "Member à ajouter.",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "capacity",
            description: "La fonction du membre.",
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: "Gérant", value: "gérant" },
                { name: "Habitant", value: "habitant" },
            ],
            required: true
        },
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

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !country.members.find(a => a.id === interaction.member.id && a.capacity === "gérant")) throw new Error("Vous n'avez pas la permission pour créer un pays !");

        const member = interaction.options.getMember("member", true);
        const capacity = interaction.options.getString("capacity", true);

        await country.addMember(member.id, capacity);

        return interaction.reply({ content: `:white_check_mark: <@${member.id}> a été ajouté au pays !` });
    }
}