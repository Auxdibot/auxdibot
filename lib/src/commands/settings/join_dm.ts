import {EmbedField,
    SlashCommandBuilder, Channel, TextChannel, APIEmbed
} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import Embeds from "../../util/constants/Embeds";
import EmbedParameters, {toAPIEmbed} from "../../util/types/EmbedParameters";
import parsePlaceholders from "../../util/functions/parsePlaceholder";
import AuxdibotCommandInteraction from "../../util/templates/AuxdibotCommandInteraction";
import GuildAuxdibotCommandData from "../../util/types/commandData/GuildAuxdibotCommandData";

const joinCommand = <AuxdibotCommand>{
    data: new SlashCommandBuilder()
        .setName('join_dm')
        .setDescription('Change settings for join DM messages on the server.')
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
                .setDescription("The text to use when a member joins the server")))
        .addSubcommand(builder => builder.setName('preview').setDescription('Preview the join embed.')),
    info: {
        help: {
            commandCategory: "Settings",
            name: "/join_dm",
            description: "Change settings for join DM messages on the server. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
            usageExample: "/join_dm (embed|embed_json|text|preview)"
        },
        permission: "settings.joindm"
    },
    subcommands: [{
        name: "embed",
        info: {
            help: {
                commandCategory: "Settings",
                name: "/join_dm embed (color) (title) [author_text] [description] [fields (split title and description with `\"|d|\"``, and seperate fields with `\"|s|\"`)] [footer] [image url] [thumbnail url]",
                description: "Add an embed to the join DM message. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
                usageExample: "/join_dm embed"
            },
            permission: "settings.joindm.embed"
        },
        async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
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

            interaction.data.guildData.setJoinDMEmbed(toAPIEmbed(parameters));
            let embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = "Success!";
            embed.description = `Set the join DM embed.`;

            if (interaction.channel && (interaction.channel as Channel).isTextBased()) {
                try {
                    let channel = (interaction.channel) as TextChannel;
                    await channel.send({ content: "Here's a preview of the new join DM embed!", embeds: [JSON.parse(await parsePlaceholders(JSON.stringify(interaction.data.guildData.settings.join_dm_embed), interaction.data.guild, interaction.data.member)) as APIEmbed] });
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
                    name: "/joindm embed_json (json)",
                    description: "Add an embed to the join DM message using custom JSON. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
                    usageExample: "/joindm embed_json"
                },
                permission: "settings.joindm.embed.json"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let json = interaction.options.getString('json') || undefined;
                if (!json) return;
                let jsonEmbed = JSON.parse(json) as APIEmbed;
                if (!jsonEmbed['type'] || jsonEmbed['type'] != "rich") {
                    let error = Embeds.ERROR_EMBED.toJSON();
                    error.description = "This isn't valid Embed JSON!";
                    return await interaction.reply({ embeds: [error] });
                }
                interaction.data.guildData.setJoinDMEmbed(jsonEmbed);
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "Success!";
                embed.description = `Set the join DM embed.`;

                if (interaction.channel && (interaction.channel as Channel).isTextBased()) {
                    try {
                        let channel = (interaction.channel) as TextChannel;
                        await channel.send({ content: "Here's a preview of the new join DM embed!", embeds: [JSON.parse(await parsePlaceholders(JSON.stringify(interaction.data.guildData.settings.join_dm_embed), interaction.data.guild, interaction.data.member)) as APIEmbed] });
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
                    name: "/join_dm text (text)",
                    description: "Add text to the join DM message.",
                    usageExample: "/join_dm text"
                },
                permission: "settings.joindm.text"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let text = interaction.options.getString('text') || "";
                interaction.data.guildData.setJoinDMText(text);
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "Success!";
                embed.description = `Set the join message text to "${interaction.data.guildData.settings.join_dm_text}".`;
                return await interaction.reply({ embeds: [embed] });
            }
        },
        {
            name: "preview",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/join_dm preview",
                    description: "Preview the join DM message.",
                    usageExample: "/join_dm preview"
                },
                permission: "settings.joindm.preview"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                try {
                    return await interaction.reply({ content: `**EMBED PREVIEW**\r\n${interaction.data.guildData.settings.join_dm_text || ""}`, embeds: interaction.data.guildData.settings.join_dm_embed ? [JSON.parse(await parsePlaceholders(JSON.stringify(interaction.data.guildData.settings.join_dm_embed), interaction.data.guild, interaction.data.member)) as APIEmbed] : [] });
                } catch (x) {
                    let error = Embeds.ERROR_EMBED.toJSON();
                    error.description = "This isn't valid! Try changing the Join Embed or Join Text.";
                    return await interaction.reply({ embeds: [error] });
                }
            }
        }],
    async execute() {
        return;
    },
}
module.exports = joinCommand;