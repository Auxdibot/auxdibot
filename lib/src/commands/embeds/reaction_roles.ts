import {
    ChatInputCommandInteraction,
    SlashCommandBuilder, APIEmbed
} from "discord.js";
import Command from "../../util/templates/Command";
import Embeds from "../../util/constants/Embeds";
import Server from "../../mongo/model/Server";

const reactionRolesCommand = <Command>{
    data: new SlashCommandBuilder()
        .setName('reaction_roles')
        .setDescription('Create, edit, remove, or list the currently active reaction roles.')
        .addSubcommand(builder => builder.setName("add").setDescription("Add a reaction role to the server."))
        .addSubcommand(builder => builder.setName("remove").setDescription("Remove a reaction role from the server."))
        .addSubcommand(builder => builder.setName("edit").setDescription("Edit a reaction role on this server."))
        .addSubcommand(builder => builder.setName("list").setDescription("List the reaction roles on this server.")),
    info: {
        help: {
            commandCategory: "Embeds",
            name: "/reaction_roles",
            description: "Create, edit, remove, or list the currently active reaction roles.",
            usageExample: "/reaction_roles (add|remove|list)"
        },
        permission: "rr"
    },
    subcommands: [{
            name: "add",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/reaction_roles add",
                    description: "Add a reaction role to the server.",
                    usageExample: "/reaction_roles add"
                },
                permission: "rr.add"
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
                    name: "/reaction_roles remove",
                    description: "Remove a role that is assigned when a member joins the server.",
                    usageExample: "/reaction_roles remove"
                },
                permission: "rr.remove"
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
                    name: "/reaction_roles list",
                    description: "List the reaction roles on this server.",
                    usageExample: "/reaction_roles list"
                },
                permission: "rr.list"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
                let server = await Server.findOrCreateServer(interaction.guild.id);
            }
        },
        {
            name: "edit",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/reaction_roles edit",
                    description: "Edit a reaction role on this server.",
                    usageExample: "/reaction_roles edit"
                },
                permission: "rr.edit"
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
module.exports = reactionRolesCommand;