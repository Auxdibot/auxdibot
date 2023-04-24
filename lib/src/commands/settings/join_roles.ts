import {
    ChatInputCommandInteraction,
    SlashCommandBuilder, APIEmbed, Guild, Role, PermissionsBitField, GuildMember
} from "discord.js";
import Command from "../../util/templates/Command";
import Server from "../../mongo/model/Server";
import Embeds from "../../util/constants/Embeds";

const joinRolesCommand = <Command>{
    data: new SlashCommandBuilder()
        .setName('join_roles')
        .setDescription('Change the roles given when a member joins the server.')
        .addSubcommand(builder => builder.setName("add")
            .setDescription("Add a role to be kept when a member rejoins the server.")
            .addRoleOption(argBuilder => argBuilder.setName("role")
                .setDescription("The role to be kept when a member rejoins the server.")
                .setRequired(true)))
        .addSubcommand(builder => builder.setName("remove").setDescription("Remove a role that is kept when a member rejoins the server.")
            .addRoleOption(argBuilder => argBuilder.setName("role")
                .setDescription("The role to be kept when a member rejoins the server."))
            .addNumberOption(argBuilder => argBuilder.setName("index")
                .setDescription("The index of the sticky role to remove, which is the placement of the item on /join_roles list")))
        .addSubcommand(builder => builder.setName("list").setDescription("List the roles that are assigned when a member joins the server.")),
    info: {
        help: {
            commandCategory: "Settings",
            name: "/join_roles",
            description: "Change the roles given when a member joins the server.",
            usageExample: "/join_roles (add|remove|list)"
        },
        permission: "settings.join_roles"
    },
    subcommands: [{
            name: "add",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/join_roles add",
                    description: "Add a role to be assigned when a member joins the server.",
                    usageExample: "/join_roles add (role)"
                },
                permission: "settings.join_roles.add"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild || !interaction.member || !interaction.memberPermissions) return;
                let guild: Guild = interaction.guild;
                let member = interaction.member as GuildMember;
                let role = interaction.options.getRole("role") as Role | null;
                if (role == null || role.id == guild.roles.everyone.id) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This is the everyone role or the role doesn't exist!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                let server = await Server.findOrCreateServer(interaction.guild.id);
                if (server.settings.join_roles.find((val) => role != null && val == role.id)) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This role is already added!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                if (role && (member.id != guild.ownerId  && !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)) && role.comparePositionTo(member.roles.highest) <= 0) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This role is higher than yours!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                if (role && guild.members.me && role.comparePositionTo(guild.members.me.roles.highest) >= 0) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This role is higher than Auxdibot's highest role!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                server.addJoinRole(role.id);
                let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                successEmbed.title = "👋 Added Join Role"
                successEmbed.description = `Added <@&${role.id}> to the join roles.`;
                return await interaction.reply({ embeds: [successEmbed] });
            }
        },
        {
            name: "remove",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/join_roles remove",
                    description: "Remove a role that is assigned when a member joins the server. If you've deleted the role, use the index parameter, which is the placement of the item on /join_roles list.",
                    usageExample: "/join_roles remove [role] [index]"
                },
                permission: "settings.join_roles.remove"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild || !interaction.member || !interaction.memberPermissions) return;
                let guild: Guild = interaction.guild;
                let member = interaction.member as GuildMember;
                let role = interaction.options.getRole("role") as Role | null, index = interaction.options.getNumber("index");
                if ((role == null && !index) || (role && role.id == guild.roles.everyone.id)) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This is the everyone role or the role doesn't exist!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                if (role && (member.id != guild.ownerId  && !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)) && role.comparePositionTo(member.roles.highest) <= 0) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This role is higher than yours!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                if (role && guild.members.me && role.comparePositionTo(guild.members.me.roles.highest) >= 0) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This role is higher than Auxdibot's highest role!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                let server = await Server.findOrCreateServer(interaction.guild.id);
                let joinRole = role != null ? server.settings.join_roles.find((val) => role != null && val == role.id) : index ? server.settings.join_roles[index-1] : undefined;
                if (!joinRole) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This join role doesn't exist!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                console.log(server.settings.join_roles.indexOf(joinRole));
                server.removeJoinRole(server.settings.join_roles.indexOf(joinRole));
                let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                successEmbed.title = "👋 Removed Join Role"
                successEmbed.description = `Removed <@&${joinRole}> from the join roles.`;
                return await interaction.reply({ embeds: [successEmbed] });
            }
        },
        {
            name: "list",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/join_roles list",
                    description: "List the roles that are assigned when a member joins the server.",
                    usageExample: "/join_roles list"
                },
                permission: "settings.join_roles.list"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
                let server = await Server.findOrCreateServer(interaction.guild.id);
                let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                successEmbed.title = "👋 Join Roles"
                successEmbed.description = server.settings.join_roles.reduce((accumulator, value, index) => `${accumulator}\n**${index+1})** <@&${value}>`, "");
                return await interaction.reply({ embeds: [successEmbed] });
            }
        }],
    async execute() {
        return;
    },
}
module.exports = joinRolesCommand;