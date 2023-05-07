import {SlashCommandBuilder, APIEmbed, ChannelType, TextChannel, Role, EmbedField, GuildMember, GuildBasedChannel} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import {IReaction} from "../../mongo/schema/ReactionRoleSchema";
import Embeds from "../../util/constants/Embeds";
import EmbedParameters, {toAPIEmbed} from "../../util/types/EmbedParameters";
import parsePlaceholders from "../../util/functions/parsePlaceholder";
import {getMessage} from "../../util/functions/getMessage";
import AuxdibotCommandInteraction from "../../util/templates/AuxdibotCommandInteraction";
import GuildAuxdibotCommandData from "../../util/types/commandData/GuildAuxdibotCommandData";
import {LogType} from "../../util/types/Log";
import emojiRegex from "emoji-regex";

const reactionRolesCommand = <AuxdibotCommand>{
    data: new SlashCommandBuilder()
        .setName('reaction_roles')
        .setDescription('Create, edit, remove, or list the currently active reaction roles.')
        .addSubcommand(builder => builder.setName("add")
            .setDescription("Add a reaction role to the server.")
            .addChannelOption(argBuilder => argBuilder.setName("channel")
                .setDescription("The channel to put the reaction role embed in.")
                .setRequired(true))
            .addStringOption(argBuilder => argBuilder.setName("roles")
                .setDescription("Space between emoji & role. (ex. [emoji] [role] [...emoji2] [...role2])")
                .setRequired(true))
            .addStringOption(argBuilder => argBuilder.setName("title")
                .setDescription("Title of the reaction roles."))
            )
        .addSubcommand(builder => builder.setName("add_custom")
            .setDescription("Add a reaction role to the server.")
            .addChannelOption(argBuilder => argBuilder.setName("channel")
                .setDescription("The channel to put the reaction role embed in.")
                .setRequired(true))
            .addStringOption(argBuilder => argBuilder.setName("roles")
                .setDescription("Space between emoji & role. (ex. [emoji] [role] [...emoji2] [...role2])")
                .setRequired(true))
            .addStringOption(option => option.setName("color")
                .setDescription("The color of the Embed as a HEX color code.")
                .setRequired(true))
            .addStringOption(option => option.setName("title")
                .setDescription("The title of the Embed.")
                .setRequired(true))
            .addStringOption(option => option.setName("description")
                .setDescription("The description of the Embed. (Optional)"))
            .addStringOption(option => option.setName("content")
                .setDescription("The message content to send with the embed. (Optional)"))
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
        .addSubcommand(builder => builder.setName("add_json")
            .setDescription("Add a reaction role to the server.")
            .addChannelOption(argBuilder => argBuilder.setName("channel")
                .setDescription("The channel to put the reaction role embed in.")
                .setRequired(true))
            .addStringOption(argBuilder => argBuilder.setName("roles")
                .setDescription("Space between emoji & role. (ex. [emoji] [role] [...emoji2] [...role2])")
                .setRequired(true))
            .addStringOption(argBuilder => argBuilder.setName("json")
                .setDescription("The JSON for the Discord Embed attached to the reaction role.")
                .setRequired(true))
        )
        .addSubcommand(builder => builder.setName("remove").setDescription("Remove a reaction role from the server.")
            .addStringOption(argBuilder => argBuilder.setName("message_id").setDescription("The message id of the reaction role."))
            .addNumberOption(argBuilder => argBuilder.setName("index").setDescription("The index of the reaction role, which is the placement of the item on /reaction_roles list.")))
        .addSubcommand(builder => builder.setName("edit").setDescription("Edit a reaction role embed on this server.")
            .addStringOption(argBuilder => argBuilder.setName("message_id").setDescription("The message id of the reaction role."))
            .addNumberOption(argBuilder => argBuilder.setName("index").setDescription("The index of the reaction role, which is the placement of the item on /reaction_roles list."))

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
                .setDescription("The JSON for the Discord Embed attached to the reaction role. (overrides embed parameters)"))
            )
        .addSubcommand(builder => builder.setName("list").setDescription("List the reaction roles on this server.")),
    info: {
        help: {
            commandCategory: "Roles",
            name: "/reaction_roles",
            description: "Create, edit, remove, or list the currently active reaction roles.",
            usageExample: "/reaction_roles (add|remove|edit|list)"
        },
        permission: "rr"
    },
    subcommands: [{
            name: "add",
            info: {
                help: {
                    commandCategory: "Roles",
                    name: "/reaction_roles add",
                    description: "Add a reaction role to the server.",
                    usageExample: "/reaction_roles add (channel) (roles)"
                },
                permission: "rr.add"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let data = await interaction.data.guildData.fetchData();
                let channel = interaction.options.getChannel("channel"), roles = interaction.options.getString("roles"), title = interaction.options.getString("title") || "React to receive roles!";
                if (!channel || !roles) return;
                if (channel.type != ChannelType.GuildText) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This isn't a text channel!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                channel = channel as TextChannel;
                let split = roles.split(' ');
                let builder = [];
                while (split.length) builder.push(split.splice(0,2));
                type IReactionAndRole = { emoji: string, role: Role };
                let reactionsAndRoles: IReactionAndRole[] = await builder.reduce(async (accumulator: Promise<IReactionAndRole[]> | IReactionAndRole[], item: string[]) => {

                    let arr: IReactionAndRole[] = await accumulator;
                    if (!interaction.data) return arr;
                    if (!item[0] || !item[1]) return arr;
                    let role = await interaction.data.guild.roles.fetch((item[1].match(/\d+/) || [])[0] || "");
                    const regex = emojiRegex();
                    let emojis = item[0].match(regex);
                    let emoji = interaction.client.emojis.cache.find((i) => i.toString() == item[0]) || (emojis != null ? emojis[0] : null);
                    if (emoji && role) {
                        arr.push({ emoji: item[0], role });
                    }
                    return arr;
                }, [] as Promise<IReactionAndRole[]> | IReactionAndRole[]);
                if (reactionsAndRoles.length <= 0) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "No reactions and roles found! Please use spaces between reactions and roles. (ex. [emoji] [role] [emoji2] [role2] ...)";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                let embed = Embeds.REACTION_ROLE_EMBED.toJSON();
                embed.title = title;
                embed.description = reactionsAndRoles.reduce((accumulator: string, item, index) => `${accumulator}\r\n\r\n> **${index+1})** ${item.emoji} - <@&${item.role.id}>`, "");
                let message = await channel.send({ embeds: [embed] });

                reactionsAndRoles.forEach((item) => message.react(item.emoji));
                data.addReactionRole({ message_id: message.id, channel_id: message.channel.id, reactions: reactionsAndRoles.map((item) => <IReaction>{ role: item.role.id, emoji: item.emoji }) });
                let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                successEmbed.title = "👈 Created Reaction Role"
                successEmbed.description = `Created a reaction role in ${channel}`;
                await interaction.data.guildData.log({
                    user_id: interaction.data.member.id,
                    description: `Created a reaction role in ${channel.name}`,
                    type: LogType.REACTION_ROLE_ADDED,
                    date_unix: Date.now()
                })
                return await interaction.reply({ embeds: [successEmbed] });
            }
        },
        {
            name: "add_custom",
            info: {
                help: {
                    commandCategory: "Roles",
                    name: "/reaction_roles add_custom",
                    description: "Add a reaction role to the server with custom Embed parameters.",
                    usageExample: "/reaction_roles add_custom (channel) (roles) (color) (title) [author_text] [description] [fields (split title and description with `\"|d|\"``, and seperate fields with `\"|s|\"`)] [footer] [image url] [thumbnail url]"
                },
                permission: "rr.add.custom"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let channel = interaction.options.getChannel("channel"), roles = interaction.options.getString("roles"),
                    color = interaction.options.getString("color"),
                    title = interaction.options.getString("title")?.replace(/\\n/g, "\n"),
                    description = interaction.options.getString("description")?.replace(/\\n/g, "\n") || null,
                    content = interaction.options.getString("content")?.replace(/\\n/g, "\n") || "",
                    author_text = interaction.options.getString("author_text")?.replace(/\\n/g, "\n") || null,
                    fields = interaction.options.getString("fields")?.replace(/\\n/g, "\n") || null,
                    footer = interaction.options.getString("footer")?.replace(/\\n/g, "\n") || null,
                    image_url = interaction.options.getString("image_url") || null,
                    thumbnail_url = interaction.options.getString("thumbnail_url") || null;
                let data = await interaction.data.guildData.fetchData();
                if (!color || !/(#|)[0-9a-fA-F]{6}/.test(color)) {
                    let error = Embeds.ERROR_EMBED.toJSON();
                    error.description = "Invalid hex color code!";
                    return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] })
                }
                if (!channel || !roles) return;
                if (channel.type != ChannelType.GuildText) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This isn't a text channel!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                channel = channel as TextChannel;
                let split = roles.split(' ');
                let builder = [];
                while (split.length) builder.push(split.splice(0,2));
                let reactionsAndRoles: IReaction[] = await builder.reduce(async (accumulator: Promise<IReaction[]> | IReaction[], item: string[]) => {

                    let arr: IReaction[] = await accumulator;
                    if (!interaction.data) return arr;
                    if (!item[0] || !item[1]) return arr;
                    let role = await interaction.data.guild.roles.fetch((item[1].match(/\d+/) || [])[0] || "");
                    const regex = emojiRegex();
                    let emojis = item[0].match(regex);
                    let emoji = interaction.client.emojis.cache.find((i) => i.toString() == item[0]) || (emojis != null ? emojis[0] : null);
                    if (emoji && role) {
                        arr.push({ emoji: item[0], role: role.id });
                    }
                    return arr;
                }, [] as Promise<IReaction[]> | IReaction[]);
                if (reactionsAndRoles.length <= 0) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "No reactions and roles found! Please use spaces between reactions and roles. (ex. [emoji] [role] [emoji2] [role2] ...)";
                    return await interaction.reply({ embeds: [errorEmbed] });
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
                let message = await channel.send({ content: content, embeds: [toAPIEmbed(JSON.parse(await parsePlaceholders(JSON.stringify(parameters), interaction.data.guild, interaction.member as GuildMember | undefined))) as APIEmbed] }).catch(() => undefined);
                if (!message) {
                    let embed = Embeds.ERROR_EMBED.toJSON();
                    embed.description = `There was an error sending that embed!`;
                    return await interaction.reply({ embeds: [embed] });
                }
                reactionsAndRoles.forEach((item) => message ? message.react(item.emoji) : undefined);
                data.addReactionRole({ message_id: message.id, reactions: reactionsAndRoles });
                let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                successEmbed.title = "👈 Created Reaction Role"
                successEmbed.description = `Created a reaction role in ${channel}`;
                await interaction.data.guildData.log({
                    user_id: interaction.data.member.id,
                    description: `Created a reaction role in ${channel.name}`,
                    type: LogType.REACTION_ROLE_ADDED,
                    date_unix: Date.now()
                })
                return await interaction.reply({ embeds: [successEmbed] });
            }
        },
        {
            name: "add_json",
            info: {
                help: {
                    commandCategory: "Roles",
                    name: "/reaction_roles add_json",
                    description: "Add a reaction role to the server with custom Discord Embed JSON.",
                    usageExample: "/reaction_roles add_json (channel) (roles) (json)"
                },
                permission: "rr.add.json"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let channel = interaction.options.getChannel("channel"), roles = interaction.options.getString("roles"),
                    json = interaction.options.getString("json");
                let data = await interaction.data.guildData.fetchData();
                if (!channel || !roles) return;
                if (channel.type != ChannelType.GuildText) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This isn't a text channel!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                channel = channel as TextChannel;
                let split = roles.split(' ');
                let builder = [];
                while (split.length) builder.push(split.splice(0,2));
                let reactionsAndRoles: IReaction[] = await builder.reduce(async (accumulator: Promise<IReaction[]> | IReaction[], item: string[]) => {

                    let arr: IReaction[] = await accumulator;
                    if (!interaction.data) return arr;
                    if (!item[0] || !item[1]) return arr;
                    let role = await interaction.data.guild.roles.fetch((item[1].match(/\d+/) || [])[0] || "");
                    const regex = emojiRegex();
                    let emojis = item[0].match(regex);
                    let emoji = interaction.client.emojis.cache.find((i) => i.toString() == item[0]) || (emojis != null ? emojis[0] : null);
                    if (emoji && role) {
                        arr.push({ emoji: item[0], role: role.id });
                    }
                    return arr;
                }, [] as Promise<IReaction[]> | IReaction[]);
                if (reactionsAndRoles.length <= 0) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "No reactions and roles found! Please use spaces between reactions and roles. (ex. [emoji] [role] [emoji2] [role2] ...)";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }

                let message = await channel.send({ embeds: [JSON.parse(await parsePlaceholders(json || "", interaction.data.guild, interaction.member as GuildMember | undefined)) as APIEmbed] }).catch(() => undefined);
                if (!message) {
                    let embed = Embeds.ERROR_EMBED.toJSON();
                    embed.description = `There was an error sending that embed!`;
                    return await interaction.reply({ embeds: [embed] });
                }
                reactionsAndRoles.forEach((item) => message ? message.react(item.emoji) : undefined);
                data.addReactionRole({ message_id: message.id, reactions: reactionsAndRoles });
                let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                successEmbed.title = "👈 Created Reaction Role"
                successEmbed.description = `Created a reaction role in ${channel}`;
                await interaction.data.guildData.log({
                    user_id: interaction.data.member.id,
                    description: `Created a reaction role in ${channel.name}`,
                    type: LogType.REACTION_ROLE_ADDED,
                    date_unix: Date.now()
                })
                return await interaction.reply({ embeds: [successEmbed] });
            }
        },
        {
            name: "remove",
            info: {
                help: {
                    commandCategory: "Roles",
                    name: "/reaction_roles remove",
                    description: "Remove a role that is assigned when a member joins the server.",
                    usageExample: "/reaction_roles remove [message_id] [index]"
                },
                permission: "rr.remove"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let message_id = interaction.options.getString("message_id"), index = interaction.options.getNumber("index");
                let data = await interaction.data.guildData.fetchData();
                if (!message_id && !index) {
                    let embed = Embeds.ERROR_EMBED.toJSON();
                    embed.description = `Please include a message_id or index!`;
                    return await interaction.reply({ embeds: [embed] });
                }
                let rr = data.reaction_roles.find((val, valIndex) => message_id ? (val.message_id == message_id) : index ? (valIndex == index-1) : undefined);
                if (!rr) {
                    let embed = Embeds.ERROR_EMBED.toJSON();
                    embed.description = `Couldn't find that reaction role!`;
                    return await interaction.reply({ embeds: [embed] });
                }
                let message_channel: GuildBasedChannel | undefined = rr.channel_id ? interaction.data.guild.channels.cache.get(rr.channel_id) : undefined;
                let message = message_channel && message_channel.isTextBased() ? message_channel.messages.cache.get(rr.message_id) : await getMessage(interaction.data.guild, rr.message_id);

                if (message) {
                    await message.delete();
                }
                data.removeReactionRole(data.reaction_roles.indexOf(rr));
                let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                successEmbed.title = "👈 Deleted Reaction Role"
                successEmbed.description = `Deleted a reaction role${message ? ` in ${message.channel}` : ""}.`;
                await interaction.data.guildData.log({
                    user_id: interaction.data.member.id,
                    description: `Deleted a reaction role${message ? ` in ${message.channel || "a channel"}` : ""}.`,
                    type: LogType.REACTION_ROLE_REMOVED,
                    date_unix: Date.now()
                })
                return await interaction.reply({ embeds: [successEmbed] });
            }
        },
        {
            name: "list",
            info: {
                help: {
                    commandCategory: "Roles",
                    name: "/reaction_roles list",
                    description: "List the reaction roles on this server.",
                    usageExample: "/reaction_roles list"
                },
                permission: "rr.list"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let successEmbed = Embeds.INFO_EMBED.toJSON();
                let data = await interaction.data.guildData.fetchData();
                successEmbed.title = "👈 Reaction Roles"
                successEmbed.description = data.reaction_roles.reduce((accumulator: string, value, index) => `${accumulator}\r\n\r\n**${index+1})** Message ID: *${value.message_id}* \r\n(${value.reactions.reduce((acc: string, val2, index) => index == 0 ? `${val2.emoji}` : `${acc}, ${val2.emoji}`, "")})`, "");
                return await interaction.reply({ embeds: [successEmbed] });
            }
        },
        {
            name: "edit",
            info: {
                help: {
                    commandCategory: "Roles",
                    name: "/reaction_roles edit",
                    description: "Edit a reaction role on this server.",
                    usageExample: "/reaction_roles edit [message_id] [index] (roles) [json, overrides embed parameters] [color] [title] [author_text] [description] [fields (split title and description with `\"|d|\"``, and seperate fields with `\"|s|\"`)] [footer] [image url] [thumbnail url]"
                },
                permission: "rr.edit"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let message_id = interaction.options.getString("message_id"),
                    index = interaction.options.getNumber("index"),
                    json = interaction.options.getString("json"),
                    color = interaction.options.getString("color"),
                    title = interaction.options.getString("title")?.replace(/\\n/g, "\n"),
                    description = interaction.options.getString("description")?.replace(/\\n/g, "\n") || null,
                    author_text = interaction.options.getString("author_text")?.replace(/\\n/g, "\n") || null,
                    fields = interaction.options.getString("fields")?.replace(/\\n/g, "\n") || null,
                    footer = interaction.options.getString("footer")?.replace(/\\n/g, "\n") || null,
                    image_url = interaction.options.getString("image_url") || null,
                    thumbnail_url = interaction.options.getString("thumbnail_url") || null;
                let data = await interaction.data.guildData.fetchData();
                if (!message_id && !index) {
                    let embed = Embeds.ERROR_EMBED.toJSON();
                    embed.description = `Please include a message_id or index!`;
                    return await interaction.reply({ embeds: [embed] });
                }
                let rr = data.reaction_roles.find((val, valIndex) => message_id ? (val.message_id == message_id) : index ? (valIndex == index-1) : undefined);
                if (!rr) {
                    let embed = Embeds.ERROR_EMBED.toJSON();
                    embed.description = `Couldn't find that reaction role!`;
                    return await interaction.reply({ embeds: [embed] });
                }
                let message_channel: GuildBasedChannel | undefined = rr.channel_id ? interaction.data.guild.channels.cache.get(rr.channel_id) : undefined;
                let message = message_channel && message_channel.isTextBased() ? message_channel.messages.cache.get(rr.message_id) : await getMessage(interaction.data.guild, rr.message_id);
                if (!message) {
                    let embed = Embeds.ERROR_EMBED.toJSON();
                    embed.description = `No message found! Might want to remove that reaction role.`;
                    return await interaction.reply({ embeds: [embed] });
                }
                if (json) {
                    let messageEdit = await message.edit({ embeds: [JSON.parse(await parsePlaceholders(json || "", interaction.data.guild, interaction.member as GuildMember | undefined)) as APIEmbed]}).catch(() => undefined)
                    if (!messageEdit) {
                        let embed = Embeds.ERROR_EMBED.toJSON();
                        embed.description = `There was an error sending that embed!`;
                        return await interaction.reply({ embeds: [embed] });
                    }
                    let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                    successEmbed.title = "👈 Edited Reaction Role"
                    successEmbed.description = `Edited a reaction role${message ? ` in ${message.channel}` : ""}.`;
                    await interaction.data.guildData.log({
                        user_id: interaction.data.member.id,
                        description: `Edited a reaction role.`,
                        type: LogType.REACTION_ROLE_EDITED,
                        date_unix: Date.now()
                    })
                    return await interaction.reply({ embeds: [successEmbed] });
                }
                if (color && title) {
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
                    let messageEdit = await message.edit({ embeds: [toAPIEmbed(JSON.parse(await parsePlaceholders(JSON.stringify(parameters), interaction.data.guild, interaction.member as GuildMember | undefined))) as APIEmbed] }).catch(() => undefined);
                    if (!messageEdit) {
                        let embed = Embeds.ERROR_EMBED.toJSON();
                        embed.description = `There was an error sending that embed!`;
                        return await interaction.reply({ embeds: [embed] });
                    }
                    let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                    successEmbed.title = "👈 Edited Reaction Role"
                    successEmbed.description = `Edited a reaction role${message ? ` in ${message.channel}` : ""}.`;
                    await interaction.data.guildData.log({
                        user_id: interaction.data.member.id,
                        description: `Edited a reaction role.`,
                        type: LogType.REACTION_ROLE_EDITED,
                        date_unix: Date.now()
                    })
                    return await interaction.reply({ embeds: [successEmbed] });
                }
                let embed = Embeds.ERROR_EMBED.toJSON();
                embed.description = `Nothing happened.`;
                return await interaction.reply({ embeds: [embed] });
            }
        }],
    async execute() {
        return;
    },
}
module.exports = reactionRolesCommand;