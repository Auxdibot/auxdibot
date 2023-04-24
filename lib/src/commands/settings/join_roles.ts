import {
    ChatInputCommandInteraction,
    SlashCommandBuilder, APIEmbed
} from "discord.js";
import Command from "../../util/templates/Command";
import Server from "../../mongo/model/Server";

const joinRolesCommand = <Command>{
    data: new SlashCommandBuilder()
        .setName('join_roles')
        .setDescription('Change the roles given when a member joins the server.')
        .addSubcommand(builder => builder.setName("add")
            .setDescription("Add a role to be kept when a member rejoins the server.")
            .addRoleOption(argBuilder => argBuilder.setName("role")
                .setDescription("The role to be kept when a member rejoins the server.")
                .setRequired(true)))
        .addSubcommand(builder => builder.setName("remove").setDescription("Remove a role that is kept when a member rejoins the server.")
            .addRoleOption(argBuilder => argBuilder.setName("role")
                .setDescription("The role to be kept when a member rejoins the server."))
            .addNumberOption(argBuilder => argBuilder.setName("index")
                .setDescription("The index of the sticky role to remove, which is the placement of the item on /join_roles list")))
        .addSubcommand(builder => builder.setName("list").setDescription("List the roles that are assigned when a member joins the server.")),
    info: {
        help: {
            commandCategory: "Settings",
            name: "/join_roles",
            description: "Change the roles given when a member joins the server.",
            usageExample: "/join_roles (add|remove|list)"
        },
        permission: "settings.join_roles"
    },
    subcommands: [{
            name: "add",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/join_roles add",
                    description: "Add a role to be assigned when a member joins the server.",
                    usageExample: "/join_roles add (role)"
                },
                permission: "settings.join_roles.add"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
                let server = await Server.findOrCreateServer(interaction.guild.id);
            }
        },
        {
            name: "remove",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/join_roles remove",
                    description: "Remove a role that is assigned when a member joins the server. If you've deleted the role, use the index parameter, which is the placement of the item on /join_roles list.",
                    usageExample: "/join_roles remove [role] [index]"
                },
                permission: "settings.join_roles.remove"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
                let server = await Server.findOrCreateServer(interaction.guild.id);
            }
        },
        {
            name: "list",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/join_roles list",
                    description: "List the roles that are assigned when a member joins the server.",
                    usageExample: "/join_roles list"
                },
                permission: "settings.join_roles.list"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
                let server = await Server.findOrCreateServer(interaction.guild.id);
            }
        }],
    async execute() {
        return;
    },
}
module.exports = joinRolesCommand;