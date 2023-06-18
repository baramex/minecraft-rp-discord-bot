const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder, Colors } = require("discord.js");
const Company = require("../modules/Company");

module.exports = {
    name: "company",
    description: "Permet de gérer les entreprise.",
    run: async interaction => {
        const action = interaction.options.getSubcommandGroup() || interaction.options.getSubcommand();
        const subaction = interaction.options.getSubcommand();

        if (action === "create") {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) throw new Error("Vous n'avez pas la permission pour créer une entreprise !");
            await interaction.deferReply();

            const name = interaction.options.getString("name", true);
            const logo = interaction.options.getString("logo", true);

            const company = await Company.create(name, logo);

            return interaction.editReply({ content: `:white_check_mark: L'entreprise ${company.name} a été créé avec succès !` });
        }
        else if (action === "edit") {
            const id = interaction.options.getNumber("id", true);
            const company = Company.load(id);

            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !company.members.find(a => a.id === interaction.member.id && a.capacity === "CEO")) throw new Error("Vous n'avez pas la permission pour créer une entreprise !");

            const name = interaction.options.getString("name", false);
            const logo = interaction.options.getString("logo", false);

            if (!name && !logo) throw new Error("Vous devez spécifier au moins un paramètre !");

            company.name = name || company.name;
            company.logo = logo || company.logo;
            await company.save();

            return interaction.reply({ content: `:white_check_mark: L'entreprise ${company.name} a été modifié !` });
        }
        else if (action === "list") {
            const companies = Company.getAll();

            const embed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle("Liste de " + companies.length + " entreprises")
                .setDescription(companies.map(a => `- **${a.name}** (${a.id}) | <#${a.channels.find(a => a.name === "membres")?.id}>`).join("\n") || "Aucune entreprise.");

            return interaction.reply({ embeds: [embed] });
        }
        else if (action === "delete") {
            const id = interaction.options.getNumber("id", true);
            const company = Company.load(id);
            const name = company.name;

            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !company.members.find(a => a.id === interaction.member.id && a.capacity === "CEO")) throw new Error("Vous n'avez pas la permission pour créer une entreprise !");

            await company.remove();

            return interaction.reply({ content: `:white_check_mark: L'entreprise ${name} a été supprimé !` });
        }
        else if (action === "members") {
            if (subaction === "add") {
                const id = interaction.options.getNumber("id", true);
                const company = Company.load(id);

                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !company.members.find(a => a.id === interaction.member.id && a.capacity === "CEO")) throw new Error("Vous n'avez pas la permission pour créer une entreprise !");

                const member = interaction.options.getMember("member", true);
                const capacity = interaction.options.getString("capacity", true);
                const share = interaction.options.getNumber("share", true);

                await company.addMember(member.id, capacity, share);

                return interaction.reply({ content: `:white_check_mark: <@${member.id}> a été ajouté à l'entreprise !` });
            }
            else if (subaction === "remove") {
                const id = interaction.options.getNumber("id", true);
                const company = Company.load(id);

                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !company.members.find(a => a.id === interaction.member.id && a.capacity === "CEO")) throw new Error("Vous n'avez pas la permission pour créer une entreprise !");

                const member = interaction.options.getMember("member", true);

                if (!company.members.find(a => a.id === member.id)) throw new Error("Membre non trouvé !");
                await company.removeMember(member.id);

                return interaction.reply({ content: `:white_check_mark: <@${member.id}> a été retiré de l'entreprise !` });
            }
            else if (subaction === "edit") {
                const id = interaction.options.getNumber("id", true);
                const company = Company.load(id);

                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !company.members.find(a => a.id === interaction.member.id && a.capacity === "CEO")) throw new Error("Vous n'avez pas la permission pour créer une entreprise !");

                const member = interaction.options.getMember("member", true);
                const capacity = interaction.options.getString("capacity", true);
                const share = interaction.options.getNumber("share", true);

                if (!company.members.find(a => a.id === member.id)) throw new Error("Membre non trouvé !");
                await company.editMember(member.id, capacity, share);

                return interaction.reply({ content: `:white_check_mark: <@${member.id}> a bien été modifié !` });
            }
        }
    },
    options: [
        {
            name: "create",
            description: "Permet de créer une entreprise.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "Nom de l'entreprise.",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "logo",
                    description: "Logo de l'entreprise (emoji).",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "members",
            description: "Permet de gérer les membres d'une entreprise.",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "add",
                    description: "Permet d'ajouter un membre à une entreprise.",
                    type: ApplicationCommandOptionType.Subcommand,
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
                                { name: "CEO", value: "CEO" },
                                { name: "CFO", value: "CFO" },
                                { name: "Agent", value: "agent" },
                                { name: "Collaborateur", value: "collaborateur" },
                                { name: "RH", value: "RH" },
                                { name: "Employé", value: "employé" },
                            ],
                            required: true
                        },
                        {
                            name: "share",
                            description: "La part du membre (% de l'entreprise).",
                            type: ApplicationCommandOptionType.Number,
                            min: 0,
                            max: 100,
                            required: true
                        },
                        {
                            name: "id",
                            description: "ID de l'entreprise.",
                            type: ApplicationCommandOptionType.Number,
                            required: true
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "Permet de supprimer un membre d'une entreprise.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "member",
                            description: "Member à supprimer.",
                            type: ApplicationCommandOptionType.User,
                            required: true
                        },
                        {
                            name: "id",
                            description: "ID de l'entreprise.",
                            type: ApplicationCommandOptionType.Number,
                            required: true
                        }
                    ]
                },
                {
                    name: "edit",
                    description: "Permet de modifier la fonction d'un membre d'une entreprise.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "member",
                            description: "Member à modifier.",
                            type: ApplicationCommandOptionType.User,
                            required: true
                        },
                        {
                            name: "capacity",
                            description: "La nouvelle fonction du membre.",
                            type: ApplicationCommandOptionType.String,
                            choices: [
                                { name: "CEO", value: "CEO" },
                                { name: "CFO", value: "CFO" },
                                { name: "Agent", value: "agent" },
                                { name: "Collaborateur", value: "collaborateur" },
                                { name: "RH", value: "RH" },
                                { name: "Employé", value: "employé" },
                            ],
                            required: true
                        },
                        {
                            name: "share",
                            description: "La part du membre (% de l'entreprise).",
                            type: ApplicationCommandOptionType.Number,
                            min: 0,
                            max: 100,
                            required: true
                        },
                        {
                            name: "id",
                            description: "ID de l'entreprise.",
                            type: ApplicationCommandOptionType.Number,
                            required: true
                        }
                    ]
                }
            ],
        },
        {
            name: "delete",
            description: "Permet de supprimer une entreprise.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "ID de l'entreprise.",
                    type: ApplicationCommandOptionType.Number,
                    required: true
                }
            ]
        },
        {
            name: "list",
            description: "Permet de lister les entreprises.",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "edit",
            description: "Permet de modifier une entreprise.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "ID de l'entreprise.",
                    type: ApplicationCommandOptionType.Number,
                    required: true
                },
                {
                    name: "name",
                    description: "Nom de l'entreprise.",
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: "logo",
                    description: "Logo de l'entreprise (emoji).",
                    type: ApplicationCommandOptionType.String,
                    required: false
                }
            ]
        }
    ]
};