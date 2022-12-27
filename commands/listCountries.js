const { CommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const Country = require("../modules/Country");

module.exports = {
    name: "list-countries",
    description: "Permet de récupérer la liste des pays.",
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async (interaction) => {
        const countries = Country.getAll();

        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("Liste de " + countries.length + " pays")
            .setDescription(countries.map(a => `- **${a.name}** (${a.id}) | <#${a.channels.find(a => a.name === "membres")?.id}>`).join("\n") || "Aucun pays.");

        return interaction.reply({ embeds: [embed] });
    }
}