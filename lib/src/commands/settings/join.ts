import {
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from "discord.js";
import Command from "../../util/templates/Command";

const joinCommand = <Command>{
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Change settings for join messages on the server.')
        .addSubcommand(builder => builder.setName('embed').setDescription('Display an embed (With placeholders)!')
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
                .setDescription("The URL of the thumbnail for the Embed. (Optional)")))
        .addSubcommand(builder => builder.setName('embed_json').setDescription('Display some JSON as an embed (With placeholders)!')
            .addStringOption(option => option.setName("json")
            .setDescription("The JSON data to use for creating the Discord Embed.")
            .setRequired(true)))
        .addSubcommand(builder => builder.setName("text").setDescription("Show text (With placeholders!)")
            .addStringOption(option => option.setName("text")
                .setDescription("The text to use when a member joins the server")
                .setRequired(true))),
    info: {
        help: {
            commandCategory: "Settings",
            name: "/join",
            description: "Change settings for join messages on the server. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
            usageExample: "/join (embed|embed_json|text)"
        },
        permission: "settings.join"
    },
    subcommands: [{
        name: "embed",
        info: {
            help: {
                commandCategory: "Settings",
                name: "/join embed",
                description: "Add an embed to the join message. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
                usageExample: "/join embed"
            },
            permission: "settings.join.embed"
        },
        async execute(interaction: ChatInputCommandInteraction) {
            if (!interaction.guild) return;
        }
    },
        {
            name: "embed_json",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/join embed_json",
                    description: "Add an embed to the join message using custom JSON. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
                    usageExample: "/join embed_json"
                },
                permission: "settings.join.embed.json"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
            }
        },
        {
            name: "text",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/join text",
                    description: "Add text to the join message.",
                    usageExample: "/join text"
                },
                permission: "settings.join.text"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
            }
        }],
    async execute() {
        return;
    },
}
module.exports = joinCommand;