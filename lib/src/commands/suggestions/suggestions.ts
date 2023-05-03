import {SlashCommandBuilder} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import AuxdibotCommandInteraction from "../../util/templates/AuxdibotCommandInteraction";
import GuildAuxdibotCommandData from "../../util/types/commandData/GuildAuxdibotCommandData";
import SuggestionState from "../../util/types/SuggestionState";

async function stateCommand(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>, state: SuggestionState) {

}
const settingsCommand = < AuxdibotCommand > {
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
            return;
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
                let server = interaction.data.guildData;
                return;
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
                let server = interaction.data.guildData;
                return;
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
                let server = interaction.data.guildData;
                return;
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
                let server = interaction.data.guildData;
                return;
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
                let server = interaction.data.guildData;
                return;
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
                return;
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
                return;
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
                return;
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
                return;
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
                return;
            }
        },
    ],
    async execute() {
        return;
    },
}
module.exports = settingsCommand;