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
        .addSubcommand(builder => builder.setName("add")
            .setDescription("Add a reaction role to the server.")
            .addChannelOption(argBuilder => argBuilder.setName("channel")
                .setDescription("The channel to put the reaction role embed in.")
                .setRequired(true))
            .addStringOption(argBuilder => argBuilder.setName("roles")
                .setDescription("The reaction to their corresponding role with space between. (ex. [emoji] [role] [...emoji2] [...role2])")
                .setRequired(true))
                .addStringOption(option => option.setName("color")
                    .setDescription("The color of the Embed as a HEX color code.")
                    .setRequired(true))
                .addStringOption(option => option.setName("title")
                    .setDescription("The title of the Embed.")
                    .setRequired(true))
                .addStringOption(option => option.setName("description")
                    .setDescription("The description of the Embed. (Optional)"))
                .addStringOption(option => option.setName("author_text")
                    .setDescription("The author text of the Embed. (Optional)"))
                .addStringOption(option => option.setName("fields")
                    .setDescription("Embed fields. \"Title|d|Description|s|Title|d|Description\" (Optional)"))
                .addStringOption(option => option.setName("footer")
                    .setDescription("The footer text of the Embed. (Optional)"))
                .addStringOption(option => option.setName("image_url")
                    .setDescription("The URL of the image for the Embed. (Optional)"))
                .addStringOption(option => option.setName("thumbnail_url")
                    .setDescription("The URL of the thumbnail for the Embed. (Optional)"))
            )
        .addSubcommand(builder => builder.setName("add_custom")
            .setDescription("Add a reaction role to the server.")
            .addChannelOption(argBuilder => argBuilder.setName("channel")
                .setDescription("The channel to put the reaction role embed in.")
                .setRequired(true))
            .addStringOption(argBuilder => argBuilder.setName("roles")
                .setDescription("The reaction to their corresponding role with space between. (ex. [emoji] [role] [...emoji2] [...role2])")
                .setRequired(true))
        )
        .addSubcommand(builder => builder.setName("add_json")
            .setDescription("Add a reaction role to the server.")
            .addChannelOption(argBuilder => argBuilder.setName("channel")
                .setDescription("The channel to put the reaction role embed in.")
                .setRequired(true))
            .addStringOption(argBuilder => argBuilder.setName("roles")
                .setDescription("The reaction to their corresponding role with space between. (ex. [emoji] [role] [...emoji2] [...role2])")
                .setRequired(true))
            .addStringOption(argBuilder => argBuilder.setName("json")
                .setDescription("The JSON for the Discord Embed attached to the reaction role.")
                .setRequired(true))
        )
        .addSubcommand(builder => builder.setName("remove").setDescription("Remove a reaction role from the server.")
            .addStringOption(argBuilder => argBuilder.setName("message_id").setDescription("The message id of the reaction role."))
            .addNumberOption(argBuilder => argBuilder.setName("index").setDescription("The index of the reaction role, which is the placement of the item on /reaction_roles list.")))
        .addSubcommand(builder => builder.setName("edit").setDescription("Edit a reaction role on this server.")
            .addStringOption(argBuilder => argBuilder.setName("message_id").setDescription("The message id of the reaction role."))
            .addNumberOption(argBuilder => argBuilder.setName("index").setDescription("The index of the reaction role, which is the placement of the item on /reaction_roles list."))
            .addStringOption(argBuilder => argBuilder.setName("roles")
                 .setDescription("The reaction to their corresponding role with space between. (ex. [emoji] [role] [...emoji2] [...role2])")
                 .setRequired(true))
            .addStringOption(option => option.setName("color")
                .setDescription("The color of the Embed as a HEX color code. (Optional)"))
            .addStringOption(option => option.setName("title")
                .setDescription("The title of the Embed. (Optional)"))
            .addStringOption(option => option.setName("description")
                .setDescription("The description of the Embed. (Optional)"))
            .addStringOption(option => option.setName("author_text")
                .setDescription("The author text of the Embed. (Optional)"))
            .addStringOption(option => option.setName("fields")
                .setDescription("Embed fields. ex. \"Title|d|Description|s|Title|d|Description\" (Optional)"))
            .addStringOption(option => option.setName("footer")
                .setDescription("The footer text of the Embed. (Optional)"))
            .addStringOption(option => option.setName("image_url")
                .setDescription("The URL of the image for the Embed. (Optional)"))
            .addStringOption(option => option.setName("thumbnail_url")
                .setDescription("The URL of the thumbnail for the Embed. (Optional)"))
            .addStringOption(argBuilder => argBuilder.setName("json")
                .setDescription("The JSON for the Discord Embed attached to the reaction role. (overrides embed parameters)")
                .setRequired(true))
            )
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
                    usageExample: "/reaction_roles add (channel) (roles)"
                },
                permission: "rr.add"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
                let server = await Server.findOrCreateServer(interaction.guild.id);
            }
        },
        {
            name: "add_custom",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/reaction_roles add_custom",
                    description: "Add a reaction role to the server with custom Embed parameters.",
                    usageExample: "/reaction_roles add_custom (channel) (roles) (color) (title) [author_text] [description] [fields (split title and description with `\"|d|\"``, and seperate fields with `\"|s|\"`)] [footer] [image url] [thumbnail url]"
                },
                permission: "rr.add.custom"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
                let server = await Server.findOrCreateServer(interaction.guild.id);
            }
        },
        {
            name: "add_json",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/reaction_roles add_json",
                    description: "Add a reaction role to the server with custom Discord Embed JSON.",
                    usageExample: "/reaction_roles add_json (channel) (roles) (json)"
                },
                permission: "rr.add.json"
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
                    usageExample: "/reaction_roles remove [message_id] [index]"
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
                    usageExample: "/reaction_roles edit (message_id) (roles) (color) (title) [author_text] [description] [fields (split title and description with `\"|d|\"``, and seperate fields with `\"|s|\"`)] [footer] [image url] [thumbnail url]"
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