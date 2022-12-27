const { ApplicationCommandOptionType, CommandInteraction, PermissionFlagsBits } = require("discord.js");
const Country = require("../modules/Country");

module.exports = {
    name: "remove-member",
    description: "Permet de retirer un membre à un pays.",
    options: [
        {
            name: "member",
            description: "Member à retirer.",
            type: ApplicationCommandOptionType.User,
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

        if (!country.members.find(a => a.id === member.id)) throw new Error("Membre non trouvé !");
        await country.removeMember(member.id);

        return interaction.reply({ content: `:white_check_mark: <@${member.id}> a été retiré du pays !` });
    }
}