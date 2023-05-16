import {
    SlashCommandBuilder
} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import AuxdibotCommandInteraction from "../../util/templates/AuxdibotCommandInteraction";
import GuildAuxdibotCommandData from "../../util/types/commandData/GuildAuxdibotCommandData";
import Embeds from "../../util/constants/Embeds";
const joinCommand = <AuxdibotCommand>{
    data: new SlashCommandBuilder()
        .setName('levels')
        .setDescription('Change settings for leveling on this server.')
        .addSubcommand(builder => builder.setName('leaderboard').setDescription('View the leaderboard for this server.'))
        .addSubcommand(builder => builder.setName('add_reward').setDescription('Add a reward to the Level Rewards.')
        .addNumberOption(argBuilder => argBuilder.setName("level").setDescription("The level at which this reward is given.").setRequired(true))
        .addRoleOption(argBuilder => argBuilder.setName("role").setDescription("The role that is given.").setRequired(true)))
        .addSubcommand(builder => builder.setName('remove_reward').setDescription('Remove a reward from the Level Rewards.')
        .addNumberOption(argBuilder => argBuilder.setName("level").setDescription("The level at which this reward is given.").setRequired(true)))
        .addSubcommand(builder => builder.setName('rewards').setDescription('View the Level Rewards for this server.'))
        .addSubcommand(builder => builder.setName('give_xp').setDescription('Give a user XP points.')
        .addNumberOption(argBuilder => argBuilder.setName("xp").setDescription("How much XP is given.").setRequired(true))
        .addUserOption(argBuilder => argBuilder.setName("user").setDescription("The user to give the XP to.").setRequired(true)))
        .addSubcommand(builder => builder.setName('remove_xp').setDescription('Remove XP points from a user.')
        .addNumberOption(argBuilder => argBuilder.setName("xp").setDescription("How much XP is removed.").setRequired(true))
        .addUserOption(argBuilder => argBuilder.setName("user").setDescription("The user to remove the XP from.").setRequired(true)))
        .addSubcommand(builder => builder.setName('message_xp').setDescription('Set the amount of XP given for sending a message.')
        .addNumberOption(argBuilder => argBuilder.setName("xp").setDescription("The amount of XP to give.").setRequired(true)))
        ,
    info: {
        help: {
            commandCategory: "Levels",
            name: "/levels",
            description: "Change settings for leveling on this server.",
            usageExample: "/levels (leaderboard|add_reward|rewards|remove_reward|give_exp|remove_exp|message_exp)"
        },
        permission: "levels"
    },
    subcommands: [
        {
            name: "leaderboard",
            info: {
                help: {
                    commandCategory: "Levels",
                    name: "/leaderboard",
                    description: "View the top levelled members on this server.",
                    usageExample: "/leaderboard"
                },
                allowedDefault: true,
                permission: "levels.leaderboard"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let server = interaction.data.guildData;
                let leaderboard = await server.createLeaderboard(20);
                let embed = Embeds.LEVELS_EMBED.toJSON();
                embed.title = "🎖️ Top Members";
                let placement = 0;
                embed.description = leaderboard.reduce((acc, xp, member) => {
                    
                    placement++;
                    return acc+`**${placement}**) <@${member.discord_id}> - \`Level ${member.level}\` (\`${member.xp} XP\`)\n`
                }, "");
                return await interaction.reply({ embeds: [embed] });
            }
        },
        {
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
        name: "give_xp",
        info: {
            help: {
                commandCategory: "Levels",
                name: "/levels give_xp",
                description: "Give a user XP points.",
                usageExample: "/levels give_xp (xp) (user)"
            },
            permission: "levels.exp.give"
        },
        async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            return;
        }
    },
    {
        name: "remove_xp",
        info: {
            help: {
                commandCategory: "Levels",
                name: "/levels remove_xp",
                description: "Remove XP points from a user.",
                usageExample: "/levels remove_exp (xp) (user)"
            },
            permission: "levels.xp.remove"
        },
        async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            return;
        }
    },
    {
        name: "message_xp",
        info: {
            help: {
                commandCategory: "Levels",
                name: "/levels message_xp",
                description: "Set the amount of XP given for sending a message.",
                usageExample: "/levels message_xp (xp)"
            },
            permission: "levels.message_xp"
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