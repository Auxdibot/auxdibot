import {
    ButtonStyle, ChatInputCommandInteraction, Guild, GuildMember,
    SlashCommandBuilder
} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import Embeds from '../../util/constants/Embeds';
import {LogType} from "../../mongo/schema/Log";
import Server from "../../mongo/model/Server";

const massroleCommand = < AuxdibotCommand > {
    data: new SlashCommandBuilder()
        .setName('massrole')
        .setDescription('Give everybody a role, or take a role away from anyone that has it.')
        .addSubcommand(builder => builder.setName("give").setDescription("Give everybody a role.")
            .addRoleOption(argBuilder => argBuilder.setName("role").setDescription("The role to be given.").setRequired(true)))
        .addSubcommand(builder => builder.setName("take").setDescription("Take away a role from everybody.")
            .addRoleOption(argBuilder => argBuilder.setName("role").setDescription("The role to be taken away.").setRequired(true))),
    info: {
        help: {
            commandCategory: "Roles",
            name: "/massrole",
            description: "Give everybody a role, or take a role away from anyone that has it.",
            usageExample: "/massrole (give|take)"
        },
        permission: "massrole"
    },
    subcommands: [{
        name: "give",
        info: {
            help: {
                commandCategory: "Roles",
                name: "/massrole",
                description: "Give everybody a role.",
                usageExample: "/massrole give (role)"
            },
            permission: "massrole.give"
        },
        async execute(interaction: ChatInputCommandInteraction) {
            if (!interaction.guild || !interaction.member) return;
            let guild: Guild = interaction.guild;
            let executor = interaction.member as GuildMember;
            let role = interaction.options.getRole("role");
            let server = await Server.findOrCreateServer(guild.id);
            if (!role) return;
            let embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = "Success!";
            embed.description = `Currently giving the role...`;
            await interaction.reply({ embeds: [embed] });
            let res = await guild.members.fetch();
            res.forEach((member) => {
                if (!role) return;
                if (!member.roles.resolve(role.id) && (guild.members.me && member.roles.highest.comparePositionTo(guild.members.me.roles.highest) < 0) && member.roles.highest.comparePositionTo(executor.roles.highest) < 0) {
                    member.roles.add(role.id).catch(() => undefined);

                }
            });
            await server.log({
                user_id: executor.id,
                description: `Massrole took ${role} from anyone who had it with lower role hiearchy than Auxdibot.`,
                type: LogType.MASSROLE_GIVEN,
                date_unix: Date.now()
            }, interaction.guild)
    }
    },
        {
            name: "take",
            info: {
                help: {
                    commandCategory: "Roles",
                    name: "/massrole",
                    description: "Take away a role from every user.",
                    usageExample: "/massrole take (role)"
                },
                permission: "massrole.take"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild || !interaction.member) return;
                let guild: Guild = interaction.guild;
                let executor = interaction.member as GuildMember;
                let role = interaction.options.getRole("role");
                let server = await Server.findOrCreateServer(guild.id);
                if (!role) return;
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "Success!";
                embed.description = `Currently removing the role...`;
                await interaction.reply({ embeds: [embed] });
                let res = await guild.members.fetch();
                res.forEach((member) => {
                    if (!role) return;
                    if (member.roles.resolve(role.id) && (guild.members.me && member.roles.highest.comparePositionTo(guild.members.me.roles.highest) < 0) && member.roles.highest.comparePositionTo(executor.roles.highest) < 0) {
                        member.roles.remove(role.id).catch(() => undefined);
                    }
                });
                await server.log({
                    user_id: executor.id,
                    description: `Massrole took ${role} from anyone who had it with lower role hiearchy than Auxdibot.`,
                    type: LogType.MASSROLE_TAKEN,
                    date_unix: Date.now()
                }, interaction.guild)
            }
        }],
    async execute() {
        return;
    }
}
module.exports = massroleCommand;