import {
    SlashCommandBuilder
} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import AuxdibotCommandInteraction from "../../util/templates/AuxdibotCommandInteraction";
import GuildAuxdibotCommandData from "../../util/types/commandData/GuildAuxdibotCommandData";
const joinCommand = <AuxdibotCommand>{
    data: new SlashCommandBuilder()
        .setName('levels')
        .setDescription('Change settings for leveling on this server.')
        .addSubcommand(builder => builder.setName('add_reward').setDescription('Add a reward to the Level Rewards.')
        .addNumberOption(argBuilder => argBuilder.setName("level").setDescription("The level at which this reward is given.").setRequired(true))
        .addRoleOption(argBuilder => argBuilder.setName("role").setDescription("The role that is given.").setRequired(true)))
        .addSubcommand(builder => builder.setName('remove_reward').setDescription('Remove a reward from the Level Rewards.')
        .addNumberOption(argBuilder => argBuilder.setName("level").setDescription("The level at which this reward is given.").setRequired(true)))
        .addSubcommand(builder => builder.setName('rewards').setDescription('View the Level Rewards for this server.'))
        .addSubcommand(builder => builder.setName('give_exp').setDescription('Give a user experience points.')
        .addNumberOption(argBuilder => argBuilder.setName("experience").setDescription("How much experience is given.").setRequired(true))
        .addUserOption(argBuilder => argBuilder.setName("user").setDescription("The user to give the experience to.").setRequired(true)))
        .addSubcommand(builder => builder.setName('remove_exp').setDescription('Remove experience points from a user.')
        .addNumberOption(argBuilder => argBuilder.setName("experience").setDescription("How much experience is removed.").setRequired(true))
        .addUserOption(argBuilder => argBuilder.setName("user").setDescription("The user to remove the experience from.").setRequired(true)))
        .addSubcommand(builder => builder.setName('message_exp').setDescription('Set the amount of XP given for sending a message.')
        .addNumberOption(argBuilder => argBuilder.setName("experience").setDescription("The amount of XP to give.").setRequired(true)))
        ,
    info: {
        help: {
            commandCategory: "Levels",
            name: "/levels",
            description: "Change settings for leveling on this server.",
            usageExample: "/levels (add_reward|rewards|remove_reward|give_exp|remove_exp|message_exp)"
        },
        permission: "levels"
    },
    subcommands: [{
        name: "add_reward",
        info: {
            help: {
                commandCategory: "Levels",
                name: "/levels add_reward",
                description: "Add a reward to the Level Rewards.",
                usageExample: "/levels add_reward (level) (role)"
            },
            permission: "levels.rewards.add"
        },
        async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            return;
        }
    },
    {
        name: "remove_reward",
        info: {
            help: {
                commandCategory: "Levels",
                name: "/levels remove_reward",
                description: "Remove a reward from the Level Rewards.",
                usageExample: "/levels remove_reward (level)"
            },
            permission: "levels.rewards.remove"
        },
        async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            return;
        }
    },
    {
        name: "rewards",
        info: {
            help: {
                commandCategory: "Levels",
                name: "/levels rewards",
                description: "View the Level Rewards for this server.",
                usageExample: "/levels rewards"
            },
            permission: "levels.rewards"
        },
        async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            return;
        }
    },
    {
        name: "give_exp",
        info: {
            help: {
                commandCategory: "Levels",
                name: "/levels give_exp",
                description: "Give a user experience points.",
                usageExample: "/levels give_exp (experience) (user)"
            },
            permission: "levels.exp.give"
        },
        async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            return;
        }
    },
    {
        name: "remove_exp",
        info: {
            help: {
                commandCategory: "Levels",
                name: "/levels remove_exp",
                description: "Remove experience points from a user.",
                usageExample: "/levels remove_exp (experience) (user)"
            },
            permission: "levels.exp.remove"
        },
        async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            return;
        }
    },
    {
        name: "message_exp",
        info: {
            help: {
                commandCategory: "Levels",
                name: "/levels message_exp",
                description: "Set the amount of XP given for sending a message.",
                usageExample: "/levels message_exp (experience)"
            },
            permission: "levels.message_exp"
        },
        async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            return;
        }
    },],
    async execute() {
        return;
    },
}
module.exports = joinCommand;