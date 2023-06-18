const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const Country = require("../modules/Country");

module.exports = {
    name: "country",
    description: "Permet de gérer les pays.",
    run: async interaction => {
        const action = interaction.options.getSubcommandGroup() || interaction.options.getSubcommand();
        const subaction = interaction.options.getSubcommand();

        if (action === "create") {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) throw new Error("Vous n'avez pas la permission pour créer un pays !");

            const name = interaction.options.getString("name", true);
            const flag = interaction.options.getString("flag", true);

            const country = await Country.create(name, flag);

            return interaction.reply({ content: `:white_check_mark: Le pays ${country.name} a été créé avec succès !` });
        }
        else if (action === "edit") {
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
    },
    options: [
        {
            name: "create",
            description: "Permet de créer un pays.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
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
                }
            ]
        },
        {
            name: "members",
            description: "Permet de gérer les membres d'un pays.",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "add",
                    description: "Permet d'ajouter un membre à un pays.",
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
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "Permet de supprimer un membre d'un pays.",
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
                            description: "ID du pays si ce n'est pas le votre.",
                            type: ApplicationCommandOptionType.Number,
                            required: false
                        }
                    ]
                },
                {
                    name: "edit",
                    description: "Permet de modifier la fonction d'un membre d'un pays.",
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
                        }
                    ]
                }
            ],
        },
        {
            name: "delete",
            description: "Permet de supprimer un pays.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "ID du pays si ce n'est pas le votre.",
                    type: ApplicationCommandOptionType.Number,
                    required: false
                }
            ]
        },
        {
            name: "list",
            description: "Permet de lister les pays.",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "edit",
            description: "Permet de modifier un pays.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "Nom du pays.",
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: "flag",
                    description: "Drapeau du pays.",
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: "id",
                    description: "ID du pays si ce n'est pas le votre.",
                    type: ApplicationCommandOptionType.Number,
                    required: false
                }
            ]
        }
    ]
};