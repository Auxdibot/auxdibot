import {
    APIEmbed,
    ButtonStyle,
    Channel,
    Embed, EmbedAuthorOptions,
    EmbedField,
    Guild, GuildMember,
    SlashCommandBuilder,
} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import Embeds from '../../util/constants/Embeds';
import dotenv from "dotenv";
import EmbedParameters, {toAPIEmbed} from "../../util/types/EmbedParameters";
import {getMessage} from "../../util/functions/getMessage";
import parsePlaceholders from "../../util/functions/parsePlaceholder";

dotenv.config();
const embedCommand = <AuxdibotCommand> {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Create or edit a Discord Embed with Auxdibot, as well as obtain the JSON data of any Embed.')
        .addSubcommand(builder => builder.setName("create")
            .setDescription("Create an embed with Auxdibot.")
            .addChannelOption(option => option.setName("channel")
                .setDescription("The channel to post the embed in.")
                .setRequired(true))
            .addStringOption(option => option.setName("color")
                .setDescription("The color of the Embed as a HEX color code.")
                .setRequired(true))
            .addStringOption(option => option.setName("title")
                .setDescription("The title of the Embed.")
                .setRequired(true))
            .addStringOption(option => option.setName("content")
                .setDescription("The message content to send with the embed."))
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
        .addSubcommand(builder => builder.setName("create_json")
            .setDescription("Create an embed with Auxdibot using valid Discord Embed JSON data.")
            .addChannelOption(option => option.setName("channel")
                .setDescription("The channel to post the embed in.")
                .setRequired(true))
            .addStringOption(option => option.setName("json")
                .setDescription("The JSON data to use for creating the Discord Embed.")
                .setRequired(true)))
        .addSubcommand(builder => builder.setName("edit")
            .setDescription("Edit an existing Embed by Auxdibot.")
            .addStringOption(option => option.setName("message_id")
                .setDescription("The message ID of the Embed. (Copy ID of message with Developer Mode.)")
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
                .setDescription("The URL of the thumbnail for the Embed. (Optional)")))
        .addSubcommand(builder => builder.setName("edit_json")
            .setDescription("Edit an existing Embed by Auxdibot using valid Discord Embed JSON data.")
            .addStringOption(option => option.setName("message_id")
                .setDescription("The message ID of the Embed. (Copy ID of message with Developer Mode.)")
                .setRequired(true))
            .addStringOption(option => option.setName("json")
                .setDescription("The JSON data to use for creating the Discord Embed.")
                .setRequired(true)))
        .addSubcommand(builder => builder.setName("json")
            .setDescription("Get the Discord Embed JSON data of any Embed on your server.")
            .addStringOption(option => option.setName("message_id")
                .setDescription("The message ID of the Embed. (Copy ID of message with Developer Mode.)")
                .setRequired(true))),
    info: {
        help: {
            commandCategory: "Embed",
            name: "/embed",
            description: "Create or edit a Discord Embed with Auxdibot, as well as obtain the JSON data of any Embed.",
            usageExample: "/embed (create|custom|edit|edit_custom|json)"
        },
        permission: "embed"
    },
    subcommands: [{
        name: "create",
        info: {
            help: {
                commandCategory: "Embed",
                name: "/embed create",
                usageExample: "/embed create (channel) (color) (title) [author_text] [description] [content] [fields (split title and description with `\"|d|\"``, and seperate fields with `\"|s|\"`)] [footer] [image url] [thumbnail url]",
                description: "Create an embed with Auxdibot."
            },
            permission: "embed.create"
        },
        async execute(interaction) {
            if (!interaction.guild) return;
            let channel: Channel | null = interaction.options.getChannel("channel");
            if (!channel) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
            if (!channel.isTextBased() || channel.isThread() || channel.isVoiceBased() || channel.isDMBased()) {
                let error = Embeds.ERROR_EMBED.toJSON();
                error.description = "This isn't a valid channel!";
                return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] })
            }
            let color = interaction.options.getString("color"),
                title = interaction.options.getString("title")?.replace(/\\n/g, "\n"),
                description = interaction.options.getString("description")?.replace(/\\n/g, "\n") || null,
                content = interaction.options.getString("content")?.replace(/\\n/g, "\n") || "",
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
            try {
                await channel.send({ content: content, embeds: [toAPIEmbed(JSON.parse(await parsePlaceholders(JSON.stringify(parameters), interaction.guild, interaction.member as GuildMember | undefined))) as APIEmbed] });
            } catch (x) {

                let embed = Embeds.ERROR_EMBED.toJSON();
                embed.description = `There was an error sending that embed!`;
                return await interaction.reply({ embeds: [embed] });
            }

            let embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = "Success!";
            embed.description = `Sent embed to ${channel}.`;
            return await interaction.reply({ embeds: [embed] });

        }
    },{
        name: "create_json",
        info: {
            help: {
                commandCategory: "Embed",
                name: "/embed create_json",
                usageExample: "/embed create_json (channel) (json)",
                description: "Create an embed with Auxdibot using valid Discord Embed JSON data."
            },
            permission: "embed.create.json"
        },
        async execute(interaction) {
            if (!interaction.guild) return;
            let channel: Channel | null = interaction.options.getChannel("channel");
            if (!channel) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
            if (!channel.isTextBased() || channel.isThread() || channel.isVoiceBased() || channel.isDMBased()) {
                let error = Embeds.ERROR_EMBED.toJSON();
                error.description = "This isn't a valid channel!";
                return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] })
            }
            let json = interaction.options.getString("json");
            if (!json) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
            try {
                await channel.send({ embeds: [JSON.parse(await parsePlaceholders(json, interaction.guild, interaction.member as GuildMember | undefined)) as APIEmbed] });
            } catch (x) {
                let embed = Embeds.ERROR_EMBED.toJSON();
                embed.description = `There was an error sending that embed! (Most likely due to malformed JSON.)`;
                return await interaction.reply({ embeds: [embed] });
            }

            let embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = "Success!";
            embed.description = `Sent embed to ${channel}.`;
            return await interaction.reply({ embeds: [embed] });

        }
    },{
        name: "edit",
        info: {
            help: {
                commandCategory: "Embed",
                name: "/embed edit",
                usageExample: "/embed edit (message_id) [color] [title] [author] [description] [fields (split title and description with `\"|d|\"``, and seperate fields with `\"|s|\"`)] [footer] [image url] [thumbnail url]",
                description: "Edit an existing Embed by Auxdibot."
            },
            permission: "embed.edit"
        },
        async execute(interaction) {
            if (!interaction.guild) return;
            let message_id = interaction.options.getString("message_id");
            if (!message_id) return;
            let guild: Guild = interaction.guild;
            let message = await getMessage(guild, message_id);
            let color = interaction.options.getString("color"),
                title = interaction.options.getString("title")?.replace(/\\n/g, "\n"),
                description = interaction.options.getString("description")?.replace(/\\n/g, "\n") || null,
                author_text = interaction.options.getString("author_text")?.replace(/\\n/g, "\n") || null,
                fields = interaction.options.getString("fields")?.replace(/\\n/g, "\n") || null,
                footer = interaction.options.getString("footer")?.replace(/\\n/g, "\n") || null,
                image_url = interaction.options.getString("image_url") || null,
                thumbnail_url = interaction.options.getString("thumbnail_url") || null;
            if (!message) {
                let error = Embeds.ERROR_EMBED.toJSON();
                error.description = "Couldn't find that message!";
                return await interaction.reply({embeds: [error]});
            }
            if (message.embeds.length <= 0) {
                let error = Embeds.ERROR_EMBED.toJSON();
                error.description = "No embeds exist on this message!";
                return await interaction.reply({embeds: [error]});
            }

            if (color && !/(#|)[0-9a-fA-F]{6}/.test(color)) {
                let error = Embeds.ERROR_EMBED.toJSON();
                error.description = "Invalid hex color code!";
                return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] })
            }
            let embed = message.embeds[0].toJSON();
            embed.title = title ? await parsePlaceholders(title) : embed.title;
            embed.color = color ? parseInt("0x" + color.replaceAll("#", ""), 16) : embed.color;
            embed.description = description ? await parsePlaceholders(description) : embed.description;
            embed.author = author_text ? <EmbedAuthorOptions>{
                name: await parsePlaceholders(author_text)
            } : embed.author;
            embed.fields = fields ? (await parsePlaceholders(fields)).split("|s|").map((field) => (<EmbedField>{ name: field.split("|d|")[0], value: field.split("|d|")[1] })) : embed.fields;
            embed.footer = footer ? { text: await parsePlaceholders(footer) } : embed.footer;
            embed.image = image_url ? { url: await parsePlaceholders(image_url) } : embed.image;
            embed.thumbnail = thumbnail_url ? { url: await parsePlaceholders(thumbnail_url) } : embed.thumbnail;
            try {
                await message.edit({ embeds: [embed] });
            } catch (x) {
                let embed = Embeds.ERROR_EMBED.toJSON();
                embed.description = `There was an error sending that embed! (Auxdibot cannot edit this!)`;
                return await interaction.reply({ embeds: [embed] });
            }
            let success_embed = Embeds.SUCCESS_EMBED.toJSON();
            success_embed.title = "Success!";
            success_embed.description = `Edited embed in ${message.channel}.`;
            return await interaction.reply({ embeds: [success_embed] });
        }
    },{
        name: "edit_json",
        info: {
            help: {
                commandCategory: "Embed",
                name: "/embed edit_json",
                usageExample: "/embed edit_json (message_id) (json)",
                description: "Edit an existing Embed by Auxdibot using valid Discord Embed JSON data."
            },
            permission: "embed.edit.json"
        },
        async execute(interaction) {
            if (!interaction.guild) return;
            let message_id = interaction.options.getString("message_id");
            let json = interaction.options.getString("json");
            if (!message_id || !json) return;
            let guild: Guild = interaction.guild;
            let message = await getMessage(guild, message_id);
            if (!message) {
                let error = Embeds.ERROR_EMBED.toJSON();
                error.description = "Couldn't find that message!";
                return await interaction.reply({embeds: [error]});
            }
            if (message.embeds.length <= 0) {
                let error = Embeds.ERROR_EMBED.toJSON();
                error.description = "No embeds exist on this message!";
                return await interaction.reply({embeds: [error]});
            }
            try {
                await message.edit({ embeds: [JSON.parse(await parsePlaceholders(json, interaction.guild, interaction.member  as GuildMember | undefined)) as APIEmbed] });
            } catch (x) {
                let embed = Embeds.ERROR_EMBED.toJSON();
                embed.description = `There was an error sending that embed! (Most likely due to malformed JSON, or this message wasn't made by Auxdibot!)`;
                return await interaction.reply({ embeds: [embed] });
            }
            let embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = "Success!";
            embed.description = `Edited embed in ${message.channel}.`;
            return await interaction.reply({ embeds: [embed] });
        }
    },{
        name: "json",
        info: {
            help: {
                commandCategory: "Embed",
                name: "/embed json",
                usageExample: "/embed json (message_id)",
                description: "Get the Discord Embed JSON data of any Embed on your server."
            },
            permission: "embed.json"
        },
        async execute(interaction) {

            if (!interaction.guild) return;
            let message_id = interaction.options.getString("message_id");
            if (!message_id) return;
            let guild: Guild = interaction.guild;
            let message = await getMessage(guild, message_id);
            if (!message) {
                let error = Embeds.ERROR_EMBED.toJSON();
                error.description = "Couldn't find that message!";
                return await interaction.reply({embeds: [error]});
            }
            if (message.embeds.length <= 0) {
                let error = Embeds.ERROR_EMBED.toJSON();
                error.description = "No embeds exist on this message!";
                return await interaction.reply({embeds: [error]});
            }
            let embed = Embeds.SUCCESS_EMBED.toJSON();
            try {
                embed.fields = message.embeds.map((embed: Embed, index: number) => <EmbedField>{
                    name: `Embed #${index + 1}`,
                    value: `\`\`\`${JSON.stringify(embed.toJSON())}\`\`\``
                });
                embed.title = "Embed JSON Data";
                return await interaction.reply({embeds: [embed]});
            } catch (x) {
                let error = Embeds.ERROR_EMBED.toJSON();
                error.description = "Embed is too big!";
                return await interaction.reply({embeds: [error]});
            }

        }
    }],
    async execute() {
        return;
    }
}
module.exports = embedCommand;