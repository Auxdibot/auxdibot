import {
    APIEmbed, Channel,
    ChatInputCommandInteraction, EmbedField, GuildMember,
    SlashCommandBuilder, TextChannel
} from "discord.js";
import Command from "../../util/templates/Command";
import Server from "../../mongo/model/Server";
import Embeds from "../../util/constants/Embeds";
import parsePlaceholders from "../../util/functions/parsePlaceholder";
import EmbedParameters, {toAPIEmbed} from "../../util/types/EmbedParameters";

const leaveCommand = <Command>{
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Change settings for leave messages on the server.')
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
                .setDescription("The text to use when a member leaves the server")
                .setRequired(true)))
        .addSubcommand(builder => builder.setName('preview').setDescription('Preview the leave embed.')),
    info: {
        help: {
            commandCategory: "Settings",
            name: "/leave",
            description: "Change settings for leave messages on the server. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
            usageExample: "/leave (embed|embed_json|text)"
        },
        permission: "settings.leave"
    },
    subcommands: [{
        name: "embed",
        info: {
            help: {
                commandCategory: "Settings",
                name: "/leave embed (color) (title) [author_text] [description] [fields (split title and description with `\"|d|\"``, and seperate fields with `\"|s|\"`)] [footer] [image url] [thumbnail url]",
                description: "Add an embed to the leave message. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
                usageExample: "/leave embed"
            },
            permission: "settings.leave.embed"
        },
        async execute(interaction: ChatInputCommandInteraction) {
            if (!interaction.guild) return;
            let color = interaction.options.getString("color"),
                title = interaction.options.getString("title")?.replace(/\\n/g, "\n"),
                description = interaction.options.getString("description")?.replace(/\\n/g, "\n") || null,
                author_text = interaction.options.getString("author_text")?.replace(/\\n/g, "\n") || null,
                fields = interaction.options.getString("fields")?.replace(/\\n/g, "\n") || null,
                footer = interaction.options.getString("footer")?.replace(/\\n/g, "\n") || null,
                image_url = interaction.options.getString("image_url") || null,
                thumbnail_url = interaction.options.getString("thumbnail_url") || null;
            if (!color || !/(#|)[0-9a-fA-F]{6}/.test(color)) {
                let error = Embeds.ERROR_EMBED.toJSON();
                error.description = "Invalid hex color code!";
                return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] })
            }
            let parameters = <EmbedParameters>{
                color,
                title,
                description,
                author_text,
                fields: fields ? fields.split("|s|").map((field) => (<EmbedField>{ name: field.split("|d|")[0].replace(/\\n/g, "\n"), value: field.split("|d|")[1].replace(/\\n/g, "\n") })) : undefined,
                footer,
                thumbnail_url,
                image_url
            };
            let server = await Server.findOrCreateServer(interaction.guild.id);
            server.setLeaveEmbed(toAPIEmbed(parameters));
            let embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = "Success!";
            embed.description = `Set the leave embed.`;

            if (interaction.channel && (interaction.channel as Channel).isTextBased()) {
                try {
                    let channel = (interaction.channel) as TextChannel;
                    await channel.send({ content: "Here's a preview of the new leave embed!", embeds: [JSON.parse(await parsePlaceholders(JSON.stringify(server.settings.leave_embed), interaction.guild, interaction.member as GuildMember | undefined)) as APIEmbed] });
                } catch (x) { }
            }
            return await interaction.reply({ embeds: [embed] });
        }
    },
        {
            name: "embed_json",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/leave embed_json (json)",
                    description: "Add an embed to the join message using custom JSON. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
                    usageExample: "/leave embed_json"
                },
                permission: "settings.leave.embed.json"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
                let json = interaction.options.getString('json') || undefined;
                if (!json) return;
                let jsonEmbed = JSON.parse(json) as APIEmbed;
                if (!jsonEmbed['type'] || jsonEmbed['type'] != "rich") {
                    let error = Embeds.ERROR_EMBED.toJSON();
                    error.description = "This isn't valid Embed JSON!";
                    return await interaction.reply({ embeds: [error] });
                }
                let server = await Server.findOrCreateServer(interaction.guild.id);
                server.setLeaveEmbed(jsonEmbed);
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "Success!";
                embed.description = `Set the leave embed.`;

                if (interaction.channel && (interaction.channel as Channel).isTextBased()) {
                    try {
                        let channel = (interaction.channel) as TextChannel;
                        await channel.send({ content: "Here's a preview of the new leave embed!", embeds: [JSON.parse(await parsePlaceholders(JSON.stringify(server.settings.leave_embed), interaction.guild, interaction.member as GuildMember | undefined)) as APIEmbed] });
                    } catch (x) { }
                }
                return await interaction.reply({ embeds: [embed] });
            }
        },
        {
            name: "text",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/leave text (text)",
                    description: "Add text to the join message.",
                    usageExample: "/leave text"
                },
                permission: "settings.leave.text"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
                let text = interaction.options.getString('text') || "";
                let server = await Server.findOrCreateServer(interaction.guild.id);
                server.setLeaveText(text);
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "Success!";
                embed.description = `Set the leave message text to "${server.settings.leave_text}".`;
                return await interaction.reply({ embeds: [embed] });
            }
        },
        {
            name: "preview",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/leave preview",
                    description: "Preview the leave message.",
                    usageExample: "/leave preview"
                },
                permission: "settings.leave.preview"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
                let server = await Server.findOrCreateServer(interaction.guild.id);
                try {
                    return await interaction.reply({ content: `**EMBED PREVIEW**\r\n${server.settings.leave_text || ""}`, embeds: server.settings.leave_embed ? [JSON.parse(await parsePlaceholders(JSON.stringify(server.settings.leave_embed), interaction.guild, interaction.member as GuildMember | undefined)) as APIEmbed] : [] });
                } catch (x) {
                    let error = Embeds.ERROR_EMBED.toJSON();
                    error.description = "This isn't valid! Try changing the Leave Embed or Leave Text.";
                    return await interaction.reply({ embeds: [error] });
                }
            }
        }],
    async execute() {
        return;
    },
}
module.exports = leaveCommand;