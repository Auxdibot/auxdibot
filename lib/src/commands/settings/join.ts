import {EmbedField,
    SlashCommandBuilder, Channel, TextChannel, APIEmbed
} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import Embeds from "../../util/constants/Embeds";
import EmbedParameters, {toAPIEmbed} from "../../util/types/EmbedParameters";
import parsePlaceholders from "../../util/functions/parsePlaceholder";
import AuxdibotCommandInteraction from "../../util/templates/AuxdibotCommandInteraction";
import GuildAuxdibotCommandData from "../../util/types/commandData/GuildAuxdibotCommandData";
import createEmbedParameters from "../../util/functions/createEmbedParameters";
import argumentsToEmbedParameters from "../../util/functions/argumentsToEmbedParameters";

const joinCommand = <AuxdibotCommand>{
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Change settings for join messages on the server.')
        .addSubcommand(builder => createEmbedParameters(builder.setName('message').setDescription('Display an embed (With placeholders)!')))
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
            name: "/join",
            description: "Change settings for join messages on the server. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
            usageExample: "/join (message|embed_json|preview)"
        },
        permission: "settings.join"
    },
    subcommands: [{
        name: "message",
        info: {
            help: {
                commandCategory: "Settings",
                name: "/join message",
                description: "Set the join message. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
                usageExample: "/join message [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with \"|d|\", and seperate fields with \"|s|\")] [footer] [footer icon url] [image url] [thumbnail url]"
            },
            permission: "settings.join.message"
        },
        async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            let settings = await interaction.data.guildData.fetchSettings();
            let content = interaction.options.getString("content");
            let parameters = argumentsToEmbedParameters(interaction);
            try {
                settings.setJoinEmbed(toAPIEmbed(parameters));
                if (content) {
                    settings.setJoinText(content);
                }
                await settings.save();
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "Success!";
                embed.description = `Set the join embed.`;
                await interaction.reply({ embeds: [embed] });
            } catch (x) {
                let embed = Embeds.ERROR_EMBED.toJSON();
                embed.description = "Couldn't make that embed!";
                return await interaction.reply({ embeds: [embed] });
            }
            
            
            

            if (interaction.channel && (interaction.channel as Channel).isTextBased()) {
                try {
                    let channel = (interaction.channel) as TextChannel;
                    await channel.send({ content: `Here's a preview of the new join embed!\n${settings.join_dm_text || ""}`, embeds: [JSON.parse(await parsePlaceholders(JSON.stringify(settings.join_embed), interaction.data.guild, interaction.data.member)) as APIEmbed] });
                } catch (x) { }
            }
            return;
        }
    },
        {
            name: "embed_json",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/join embed_json",
                    description: "Add an embed to the join message using custom JSON. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
                    usageExample: "/join embed_json (json)"
                },
                permission: "settings.join.embed_json"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let json = interaction.options.getString('json') || undefined;
                let settings = await interaction.data.guildData.fetchSettings();
                if (!json) return;
                let jsonEmbed = JSON.parse(json) as APIEmbed;
                if (!jsonEmbed['type'] || jsonEmbed['type'] != "rich") {
                    let error = Embeds.ERROR_EMBED.toJSON();
                    error.description = "This isn't valid Embed JSON!";
                    return await interaction.reply({ embeds: [error] });
                }
                settings.setJoinEmbed(jsonEmbed);
                await settings.save();
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "Success!";
                embed.description = `Set the join embed.`;

                if (interaction.channel && (interaction.channel as Channel).isTextBased()) {
                    try {
                        let channel = (interaction.channel) as TextChannel;
                        await channel.send({ content: "Here's a preview of the new join embed!", embeds: [JSON.parse(await parsePlaceholders(JSON.stringify(settings.join_embed), interaction.data.guild, interaction.data.member)) as APIEmbed] });
                    } catch (x) { }
                }
                return await interaction.reply({ embeds: [embed] });
            }
        },
        {
            name: "preview",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/join preview",
                    description: "Preview the join message.",
                    usageExample: "/join preview"
                },
                permission: "settings.join.preview"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let settings = await interaction.data.guildData.fetchSettings();
                try {
                    return await interaction.reply({ content: `**EMBED PREVIEW**\r\n${settings.join_text || ""}`, embeds: settings.join_embed ? [JSON.parse(await parsePlaceholders(JSON.stringify(settings.join_embed), interaction.data.guild, interaction.data.member)) as APIEmbed] : [] });
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