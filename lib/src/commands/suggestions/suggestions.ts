import {APIEmbed, Channel, SlashCommandBuilder, TextChannel} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import AuxdibotCommandInteraction from "../../util/templates/AuxdibotCommandInteraction";
import GuildAuxdibotCommandData from "../../util/types/commandData/GuildAuxdibotCommandData";
import SuggestionState, {SuggestionStateName} from "../../util/types/SuggestionState";
import Embeds from "../../util/constants/Embeds";
import {ISuggestion} from "../../mongo/schema/SuggestionSchema";
import parsePlaceholders from "../../util/functions/parsePlaceholder";
import {LogType} from "../../util/types/Log";
import {ISuggestionReaction} from "../../mongo/schema/SuggestionReactionSchema";
import emojiRegex from "emoji-regex";
import {getMessage} from "../../util/functions/getMessage";
import user from "../../mongo/model/User";
import canExecute from "../../util/functions/canExecute";
import {SuggestionsColors} from "../../util/constants/Colors";
async function stateCommand(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>, state: SuggestionState) {
    if (!interaction.data) return;
    let server = interaction.data.guildData;
    let data = await server.fetchData(), settings = await server.fetchSettings();
    let id = interaction.options.getNumber("id");
    let suggestion = data.suggestions.find((sugg) => sugg.suggestion_id == id);
    if (!suggestion) {
        let errorEmbed = Embeds.ERROR_EMBED.toJSON();
        errorEmbed.description = "Couldn't find that suggestion!";
        return await interaction.reply({ embeds: [errorEmbed] });
    }

    suggestion.status = state;
    let message = suggestion.message_id ? await getMessage(interaction.data.guild, suggestion.message_id) : undefined;
    if (!message) {
        data.removeSuggestion(suggestion.suggestion_id);
        let errorEmbed = Embeds.ERROR_EMBED.toJSON();
        errorEmbed.description = "Couldn't find the message for the suggestion!";
        return await interaction.reply({ embeds: [errorEmbed] });
    }

    await data.save();
    if (settings.suggestions_auto_delete) {
        data.removeSuggestion(suggestion.suggestion_id);
        await message.delete().catch(() => undefined);
        await server.log({
            user_id: interaction.data.member.id,
            description: `${interaction.data.member.user.tag} deleted Suggestion #${suggestion.suggestion_id}`,
            type: LogType.SUGGESTION_DELETED,
            date_unix: Date.now()
        });
    } else {
        let edit = await data.updateSuggestion(interaction.data.guild, suggestion);
        if (!edit) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "Couldn't edit that suggestion!";
            return await interaction.reply({embeds: [errorEmbed]});
        }
    }
    if (settings.suggestions_updates_channel) {
        let channel = interaction.data.guild.channels.cache.get(settings.suggestions_updates_channel);
        if (channel && channel.isTextBased()) {
            let embed = JSON.parse(await parsePlaceholders(JSON.stringify(settings.suggestions_embed), interaction.data.guild, interaction.data.member, suggestion)) as APIEmbed;
            embed.color = SuggestionsColors[suggestion.status];
            await channel.send({ content: "A suggestion has been updated.", embeds: [embed] });
        }
    }
    let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
    successEmbed.title = "Successfully edited suggestion.";
    successEmbed.description = `The suggestion #${suggestion.suggestion_id} has been updated. (Now: ${SuggestionStateName[suggestion.status]})`;
    return await interaction.reply({ embeds: [successEmbed] });
}
const suggestionsCommand = < AuxdibotCommand > {
    data: new SlashCommandBuilder()
        .setName('suggestions')
        .setDescription('The main command for handling suggestions.')
        .addSubcommand(builder => builder.setName("create").setDescription("Create a new suggestion.")
            .addStringOption(argBuilder => argBuilder.setName("suggestion").setDescription("The suggestion you want to make for this server.").setRequired(true)))
        .addSubcommand(builder => builder.setName("channel").setDescription("Change the channel where suggestions are posted.")
            .addChannelOption(argBuilder => argBuilder.setName("channel").setDescription("The channel to post suggestions in.").setRequired(true)))
        .addSubcommand(builder => builder.setName("updates_channel").setDescription("Change the channel where updates to suggestions are posted.")
            .addChannelOption(argBuilder => argBuilder.setName("channel").setDescription("The channel to post suggestion updates in.").setRequired(true)))
        .addSubcommand(builder => builder.setName("auto_delete").setDescription("Set whether suggestions are deleted upon being approved, denied, or marked as added.")
            .addBooleanOption(argBuilder => argBuilder.setName("delete").setDescription("Whether to delete suggestions upon being approved, denied or marked as added.").setRequired(true)))
        .addSubcommand(builder => builder.setName("discussion_threads").setDescription("Set whether a discussion thread is created when a suggestion is created.")
            .addBooleanOption(argBuilder => argBuilder.setName("create_thread").setDescription("Whether a discussion thread is created when a suggestion is created.").setRequired(true)))
        .addSubcommand(builder => builder.setName("reactions").setDescription("List the reactions for suggestions."))
        .addSubcommand(builder => builder.setName("add_reaction").setDescription("Add a reaction to the reactions on suggestions, with a specified value for the rating given.")
            .addStringOption(argBuilder => argBuilder.setName("reaction").setDescription("The reaction to use ( ex. 👍)").setRequired(true))
            .addNumberOption(argBuilder => argBuilder.setName("rating").setDescription("The total amount to add to the rating when this is reacted to.").setRequired(true)))
        .addSubcommand(builder => builder.setName("remove_reaction").setDescription("Remove a reaction from the reactions on suggestions.")
            .addStringOption(argBuilder => argBuilder.setName("reaction").setDescription("The reaction that is used ( ex. 👍)"))
            .addNumberOption(argBuilder => argBuilder.setName("index").setDescription("The index of the reaction on /suggestions reactions")))
        .addSubcommand(builder => builder.setName("approve").setDescription("Mark a suggestion as approved.")
            .addNumberOption(argBuilder => argBuilder.setName("id").setDescription("The ID of the suggestion.").setRequired(true)))
        .addSubcommand(builder => builder.setName("deny").setDescription("Mark a suggestion as denied.")
            .addNumberOption(argBuilder => argBuilder.setName("id").setDescription("The ID of the suggestion.").setRequired(true)))
        .addSubcommand(builder => builder.setName("consider").setDescription("Mark a suggestion as considered.")
            .addNumberOption(argBuilder => argBuilder.setName("id").setDescription("The ID of the suggestion.").setRequired(true)))
        .addSubcommand(builder => builder.setName("add").setDescription("Mark a suggestion as added.")
            .addNumberOption(argBuilder => argBuilder.setName("id").setDescription("The ID of the suggestion.").setRequired(true)))
        .addSubcommand(builder => builder.setName("ban").setDescription("Ban a user from using suggestions.")
            .addUserOption(argBuilder => argBuilder.setName("user").setDescription("The user to ban.").setRequired(true)))
        .addSubcommand(builder => builder.setName("unban").setDescription("Unban a user, allowing them to use suggestions.")
            .addUserOption(argBuilder => argBuilder.setName("user").setDescription("The user to unban.").setRequired(true)))
        .addSubcommand(builder => builder.setName("delete").setDescription("Delete a suggestion.")
            .addNumberOption(argBuilder => argBuilder.setName("id").setDescription("The ID of the suggestion.").setRequired(true))),
    info: {
        help: {
            commandCategory: "Suggestions",
            name: "/suggestions",
            description: "The main command for handling suggestions on this server.",
            usageExample: "/suggestions (create|channel|updates_channel|auto_delete|discussion_threads|reactions|remove_reaction|add_reaction|approve|deny|consider|add|ban|unban|delete)"
        },
        permission: "suggestions"
    },
    subcommands: [{
        name: "create",
        info: {
            help: {
                commandCategory: "Suggestions",
                name: "/suggestions create",
                description: "Create a suggestion.",
                usageExample: "/suggestions create (suggestion)"
            },
            permission: "suggestions.create",
            allowedDefault: true
        },
        async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            let server = interaction.data.guildData;
            let settings = await server.fetchSettings(), counter = await server.fetchCounter();
            let content = interaction.options.getString("suggestion");
            let member = await server.findOrCreateMember(interaction.data.member.id);
            if (!content) return;
            if (member && member.suggestions_banned) {
                let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                errorEmbed.description = "You are banned from making suggestions!";
                return await interaction.reply({ embeds: [errorEmbed] });
            }
            let suggestions_channel = settings.suggestions_channel ? await interaction.data.guild.channels.fetch(settings.suggestions_channel) : undefined;
            if (!suggestions_channel || !suggestions_channel.isTextBased()) {
                let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                errorEmbed.description = "No suggestions channel was found! Ask an admin to enable suggestions by setting a suggestions channel.";
                return await interaction.reply({ embeds: [errorEmbed] });
            }
            suggestions_channel = (suggestions_channel as TextChannel);
            if (!settings.suggestions_embed || settings.suggestions_reactions.length < 1) {
                let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                errorEmbed.description = "No suggestions reactions or suggestions embed could be found!";
                return await interaction.reply({ embeds: [errorEmbed] });
            }
            let suggestion = <ISuggestion>{
                suggestion_id: counter.incrementSuggestionID(),
                creator_id: interaction.data.member.id,
                content,
                status: SuggestionState.WAITING,
                rating: 0,
                date_unix: Date.now(),
            }
            let embed = settings.suggestions_embed;
            let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
            successEmbed.description = `Created a new suggestion (#${counter.suggestion_id}).`;

            await interaction.reply({ ephemeral: true, embeds: [successEmbed] });
            return await suggestions_channel.send({ embeds: [JSON.parse(await parsePlaceholders(JSON.stringify(embed), interaction.data.guild, interaction.data.member, suggestion)) as APIEmbed]})
                .then(async (msg) => {
                    settings.suggestions_reactions.forEach((reaction) => msg.react(reaction.emoji));
                    suggestion.message_id = msg.id;
                    if (settings.suggestions_discussion_threads) {
                        let thread = await msg.startThread({ name: `Suggestion #${suggestion.suggestion_id}`, reason: "New suggestion opened." }).catch(() => undefined);
                        if (thread) suggestion.discussion_thread_id = thread.id;
                    }
                    await server.addSuggestion(suggestion);
                }).catch(async () => {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    counter.suggestion_id = counter.suggestion_id - 1;
                    await counter.save();
                    errorEmbed.description = "An error occurred trying to add this!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                });
        }
    },
        {
            name: "channel",
            info: {
                help: {
                    commandCategory: "Suggestions",
                    name: "/suggestions channel",
                    description: "Change the channel where suggestions are posted.",
                    usageExample: "/suggestions channel (channel)"
                },
                permission: "suggestions.channel"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                const channel: Channel | null = interaction.options.getChannel('channel');
                let settings = await interaction.data.guildData.fetchSettings();
                if (!channel) return await interaction.reply({
                    embeds: [Embeds.ERROR_EMBED.toJSON()]
                });
                if (!channel.isTextBased() || channel.isDMBased() || channel.isThread() || channel.isVoiceBased()) {
                    let error = Embeds.ERROR_EMBED.toJSON();
                    error.description = "This isn't a text channel! Please set the log channel to be a Discord **Text Channel**.";
                    return await interaction.reply({
                        embeds: [error]
                    });
                }
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "⚙️ Suggestions Channel Changed";

                let formerChannel = interaction.data.guild.channels.resolve(settings.suggestions_channel || "");
                if (channel.id == settings.log_channel) {
                    embed.description = `Nothing changed. Suggestions channel is the same as one specified in settings.`;
                    return await interaction.reply({
                        embeds: [embed]
                    });
                }
                settings.suggestions_channel = channel.id;
                await settings.save();
                embed.description = `The suggestions channel for this server has been changed.\r\n\r\nFormerly: ${formerChannel ? `<#${formerChannel.id}>` : "None"}\r\n\r\nNow: ${channel}`;

                await interaction.data.guildData.log({
                    type: LogType.SUGGESTIONS_CHANNEL_CHANGED,
                    user_id: interaction.data.member.id,
                    date_unix: Date.now(),
                    description: "The suggestions channel for this server has been changed.",
                    log_channel: {
                        former: formerChannel ? formerChannel.id : undefined,
                        now: channel.id
                    }
                });
                return await interaction.reply({
                    embeds: [embed]
                })
            }
        },
        {
            name: "updates_channel",
            info: {
                help: {
                    commandCategory: "Suggestions",
                    name: "/suggestions updates_channel",
                    description: "Change the channel where updates to suggestions are posted.",
                    usageExample: "/suggestions updates_channel (channel)"
                },
                permission: "suggestions.channel.updates"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                const channel: Channel | null = interaction.options.getChannel('channel');
                let settings = await interaction.data.guildData.fetchSettings();
                if (!channel) return await interaction.reply({
                    embeds: [Embeds.ERROR_EMBED.toJSON()]
                });
                if (!channel.isTextBased() || channel.isDMBased() || channel.isThread() || channel.isVoiceBased()) {
                    let error = Embeds.ERROR_EMBED.toJSON();
                    error.description = "This isn't a text channel! Please set the log channel to be a Discord **Text Channel**.";
                    return await interaction.reply({
                        embeds: [error]
                    });
                }
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "⚙️ Suggestions Updates Channel Changed";

                let formerChannel = interaction.data.guild.channels.resolve(settings.suggestions_updates_channel || "");
                if (channel.id == settings.log_channel) {
                    embed.description = `Nothing changed. Suggestions updates channel is the same as one specified in settings.`;
                    return await interaction.reply({
                        embeds: [embed]
                    });
                }
                settings.suggestions_updates_channel = channel.id;
                await settings.save();
                embed.description = `The suggestions updates channel for this server has been changed.\r\n\r\nFormerly: ${formerChannel ? `<#${formerChannel.id}>` : "None"}\r\n\r\nNow: ${channel}`;

                await interaction.data.guildData.log({
                    type: LogType.SUGGESTIONS_UPDATES_CHANNEL_CHANGED,
                    user_id: interaction.data.member.id,
                    date_unix: Date.now(),
                    description: "The suggestions updates channel for this server has been changed.",
                    log_channel: {
                        former: formerChannel ? formerChannel.id : undefined,
                        now: channel.id
                    }
                });
                return await interaction.reply({
                    embeds: [embed]
                })
            }
        },
        {
            name: "auto_delete",
            info: {
                help: {
                    commandCategory: "Suggestions",
                    name: "/suggestions auto_delete",
                    description: "Set whether suggestions are deleted upon being approved, denied, or marked as added.",
                    usageExample: "/suggestions auto_delete (true|false)"
                },
                permission: "suggestions.auto_delete"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                const deleteBool: boolean | null = interaction.options.getBoolean('delete');
                let settings = await interaction.data.guildData.fetchSettings();
                if (deleteBool == null) return await interaction.reply({
                    embeds: [Embeds.ERROR_EMBED.toJSON()]
                });
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "⚙️ Suggestions Auto Delete Changed";
                let deleteSuggestions = settings.suggestions_auto_delete;
                if (deleteBool == deleteSuggestions) {
                    embed.description = `Nothing changed. Auto delete is the same as settings.`;
                    return await interaction.reply({
                        embeds: [embed]
                    });
                }
                settings.suggestions_auto_delete = deleteBool;
                await settings.save();
                embed.description = `The suggestions auto deletion for this server has been changed.\r\n\r\nFormerly: ${deleteSuggestions ? "Delete" : "Do not Delete"}\r\n\r\nNow: ${deleteBool ? "Delete" : "Do not Delete"}`;

                await interaction.data.guildData.log({
                    type: LogType.SUGGESTIONS_AUTO_DELETE_CHANGED,
                    user_id: interaction.data.member.id,
                    date_unix: Date.now(),
                    description: `The suggestions auto deletion for this server has been changed. (Now: ${deleteBool ? "Delete" : "Do not Delete"})`,
                });
                return await interaction.reply({
                    embeds: [embed]
                });

            }
        },
        {
            name: "discussion_threads",
            info: {
                help: {
                    commandCategory: "Suggestions",
                    name: "/suggestions discussion_threads",
                    description: "Set whether a discussion thread is created when a suggestion is created.",
                    usageExample: "/suggestions discussion_threads (true|false)"
                },
                permission: "suggestions.discussion_threads"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                const create_thread: boolean | null = interaction.options.getBoolean('create_thread');
                let settings = await interaction.data.guildData.fetchSettings();
                if (create_thread == null) return await interaction.reply({
                    embeds: [Embeds.ERROR_EMBED.toJSON()]
                });
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "⚙️ Suggestions Discussion Threads Changed";
                let discussionThreads = settings.suggestions_discussion_threads;
                if (create_thread == discussionThreads) {
                    embed.description = `Nothing changed. Auto delete is the same as settings.`;
                    return await interaction.reply({
                        embeds: [embed]
                    });
                }
                settings.suggestions_discussion_threads = create_thread;
                await settings.save();
                embed.description = `The suggestions auto deletion for this server has been changed.\r\n\r\nFormerly: ${discussionThreads ? "Create Thread." : "Do not create a Thread."}\r\n\r\nNow: ${create_thread ? "Create Thread." : "Do not create a Thread."}`;

                await interaction.data.guildData.log({
                    type: LogType.SUGGESTIONS_THREAD_CREATION_CHANGED,
                    user_id: interaction.data.member.id,
                    date_unix: Date.now(),
                    description: `The suggestions auto deletion for this server has been changed. (Now: ${create_thread ? "Create Thread." : "Do not create a Thread."})`,
                });
                return await interaction.reply({
                    embeds: [embed]
                });
            }
        },
        {
            name: "reactions",
            info: {
                help: {
                    commandCategory: "Suggestions",
                    name: "/suggestions reactions",
                    description: "List the reactions for suggestions.",
                    usageExample: "/suggestions reactions"
                },
                permission: "suggestions.reactions"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let infoEmbed = Embeds.INFO_EMBED.toJSON();
                let settings = await interaction.data.guildData.fetchSettings();
                infoEmbed.title = "❓ Suggestions Reactions"
                infoEmbed.description = settings.suggestions_reactions.reduce((accumulator: string, value: ISuggestionReaction, index: number) => `${accumulator}\n**${index+1})** ${value.emoji} (*Rating: ${value.rating}*)`, "");
                return await interaction.reply({ embeds: [infoEmbed] });
            }
        },
        {
            name: "add_reaction",
            info: {
                help: {
                    commandCategory: "Suggestions",
                    name: "/suggestions add_reaction",
                    description: "Add a reaction to the reactions on suggestions, with a specified value for the rating given. Positive numbers are upvotes, negative numbers are downvotes.",
                    usageExample: "/suggestions add_reaction (reaction) (rating)"
                },
                permission: "suggestions.reactions.add"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let server = interaction.data.guildData;
                let settings = await server.fetchSettings();
                let reaction = interaction.options.getString("reaction"), rating = interaction.options.getNumber("rating");
                if (!rating || !reaction) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "You need to specify a valid reaction AND rating!"
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                if (settings.suggestions_reactions.find((suggestionReaction) => suggestionReaction.emoji == reaction)) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This suggestion reaction already exists!"
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                const regex = emojiRegex();
                let emojis = reaction.match(regex);
                let emoji = interaction.client.emojis.cache.find((i) => i.toString() == reaction) || (emojis != null ? emojis[0] : null);
                if (!emoji) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This isn't a valid reaction!"
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                settings.addSuggestionsReaction({ emoji: reaction, rating });
                let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                successEmbed.description = `Added ${reaction} as a suggestion reaction, awarding ${rating} to any suggestion rating.`;
                return await interaction.reply({ embeds: [successEmbed] });

            }
        },
        {
            name: "remove_reaction",
            info: {
                help: {
                    commandCategory: "Suggestions",
                    name: "/suggestions remove_reaction",
                    description: "Remove a reaction from the reactions on suggestions.",
                    usageExample: "/suggestions remove_reaction (reaction|index)"
                },
                permission: "suggestions.reactions.remove"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let server = interaction.data.guildData;
                let settings = await server.fetchSettings();
                let reaction = interaction.options.getString("reaction"), index = interaction.options.getNumber("index");
                if (!index && !reaction) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "You need to specify a valid reaction or index!"
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                let suggestionReaction = settings.suggestions_reactions.find((i) => (index ? settings.suggestions_reactions.indexOf(i) == index-1 : false) || i.emoji == reaction)
                if (!suggestionReaction) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "Couldn't find that suggestion reaction!"
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                settings.removeSuggestionsReaction(suggestionReaction);
                let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                successEmbed.description = `Removed ${suggestionReaction.emoji} from the reactions.`;
                return await interaction.reply({ embeds: [successEmbed] });
            }
        },
        {
            name: "approve",
            info: {
                help: {
                    commandCategory: "Suggestions",
                    name: "/suggestions approve",
                    description: "Mark a suggestion as approved.",
                    usageExample: "/suggestions approve (id)"
                },
                permission: "suggestions.state.approve"
            },
            execute: (interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) => stateCommand(interaction, SuggestionState.APPROVED)
        },
        {
            name: "deny",
            info: {
                help: {
                    commandCategory: "Suggestions",
                    name: "/suggestions deny",
                    description: "Mark a suggestion as denied.",
                    usageExample: "/suggestions deny (id)"
                },
                permission: "suggestions.state.deny"
            },
            execute: (interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) => stateCommand(interaction, SuggestionState.DENIED)
        },
        {
            name: "consider",
            info: {
                help: {
                    commandCategory: "Suggestions",
                    name: "/suggestions consider",
                    description: "Mark a suggestion as considered.",
                    usageExample: "/suggestions consider (id)"
                },
                permission: "suggestions.state.consider"
            },
            execute: (interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) => stateCommand(interaction, SuggestionState.CONSIDERED)
        },
        {
            name: "add",
            info: {
                help: {
                    commandCategory: "Suggestions",
                    name: "/suggestions add",
                    description: "Mark a suggestion as added.",
                    usageExample: "/suggestions add (id)"
                },
                permission: "suggestions.state.add"
            },
            execute: (interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) => stateCommand(interaction, SuggestionState.ADDED)
        },
        {
            name: "ban",
            info: {
                help: {
                    commandCategory: "Suggestions",
                    name: "/suggestions ban",
                    description: "Ban a user from using suggestions.",
                    usageExample: "/suggestions ban (user)"
                },
                permission: "suggestions.ban"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let server = interaction.data.guildData;
                let user = interaction.options.getUser("user");
                if (!user) return;
                let executed = interaction.data.guild.members.cache.get(user.id);
                if (!executed) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "Couldn't find that member on this server!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                if (!canExecute(interaction.data.guild, interaction.data.member, executed)) {
                    let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
                    noPermissionEmbed.title = "⛔ No Permission!"
                    noPermissionEmbed.description = `This user has a higher role than you or owns this server!`
                    return await interaction.reply({ embeds: [noPermissionEmbed] });
                }
                let member = await server.findOrCreateMember(user.id);
                if (!member) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "Couldn't find that member's data! If this error persists, please seek support in our Discord server.";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                if (member.suggestions_banned) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This member is already suggestions banned!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                member.suggestions_banned = true;
                await member.save();
                let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                successEmbed.title = "Success!";
                successEmbed.description = `<@${user.id}> has been banned from suggestions.`;
                return await interaction.reply({ embeds: [successEmbed] });
            }
        },
        {
            name: "unban",
            info: {
                help: {
                    commandCategory: "Suggestions",
                    name: "/suggestions unban",
                    description: "Unban a user, allowing them to use suggestions.",
                    usageExample: "/suggestions unban (user)"
                },
                permission: "suggestions.ban.remove"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let server = interaction.data.guildData;
                let user = interaction.options.getUser("user");
                if (!user) return;
                let executed = interaction.data.guild.members.cache.get(user.id);
                if (!executed) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "Couldn't find that member on this server!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                if (!canExecute(interaction.data.guild, interaction.data.member, executed)) {
                    let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
                    noPermissionEmbed.title = "⛔ No Permission!"
                    noPermissionEmbed.description = `This user has a higher role than you or owns this server!`
                    return await interaction.reply({ embeds: [noPermissionEmbed] });
                }
                let member = await server.findOrCreateMember(user.id);
                if (!member) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "Couldn't find that member's data! If this error persists, please seek support in our Discord server.";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                if (!member.suggestions_banned) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This member isn't suggestions banned!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                member.suggestions_banned = false;
                await member.save();
                let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                successEmbed.title = "Success!";
                successEmbed.description = `<@${user.id}> has been unbanned from suggestions.`;
                return await interaction.reply({ embeds: [successEmbed] });
            }
        },
        {
            name: "delete",
            info: {
                help: {
                    commandCategory: "Suggestions",
                    name: "/suggestions delete",
                    description: "Delete a suggestion.",
                    usageExample: "/suggestions delete (id)"
                },
                permission: "suggestions.delete"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let server = interaction.data.guildData;
                let data = await server.fetchData();
                let id = interaction.options.getNumber("id");
                let suggestion = data.suggestions.find((sugg) => sugg.suggestion_id == id);
                if (!suggestion) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "Couldn't find that suggestion!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                let message = suggestion.message_id ? await getMessage(interaction.data.guild, suggestion.message_id) : undefined;
                if (message) {
                    let thread = message.thread && message.thread.id == suggestion.discussion_thread_id ? message.thread : undefined;
                    if (thread) {
                        await thread.setArchived(true, "Suggestion has been deleted.").catch(() => undefined);
                    }
                    await message.delete().catch(() => undefined);
                }
                data.removeSuggestion(suggestion.suggestion_id);
                let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                successEmbed.title = "Success";
                successEmbed.description = `Successfully deleted Suggestion #${suggestion.suggestion_id}.`;
                return await interaction.reply({ embeds: [successEmbed] });
            }
        },
    ],
    async execute() {
        return;
    },
}
module.exports = suggestionsCommand;