import {
    ChatInputCommandInteraction,
    SlashCommandBuilder, APIEmbed, Guild, GuildMember, Role, PermissionsBitField
} from "discord.js";
import Command from "../../util/templates/Command";
import Server from "../../mongo/model/Server";
import Embeds from "../../util/constants/Embeds";

const stickyRolesCommand = <Command>{
    data: new SlashCommandBuilder()
        .setName('sticky_roles')
        .setDescription('Change the roles that are kept when a member rejoins the server.')
        .addSubcommand(builder => builder.setName("add")
            .setDescription("Add a role to be kept when a member rejoins the server.")
            .addRoleOption(argBuilder => argBuilder.setName("role")
                .setDescription("The role to be kept when a member rejoins the server.")
                .setRequired(true)))
        .addSubcommand(builder => builder.setName("remove").setDescription("Remove a role that is kept when a member rejoins the server.")
            .addRoleOption(argBuilder => argBuilder.setName("role")
                .setDescription("The role to be kept when a member rejoins the server."))
            .addNumberOption(argBuilder => argBuilder.setName("index")
                .setDescription("The index of the sticky role to remove, which is the placement of the item on /sticky_roles list")))
        .addSubcommand(builder => builder.setName("list").setDescription("List the roles that are kept when a member rejoins the server.")),
    info: {
        help: {
            commandCategory: "Settings",
            name: "/sticky_roles",
            description: "Change the roles that are kept when a member rejoins the server.",
            usageExample: "/sticky_roles (add|remove|list)"
        },
        permission: "settings.sticky_roles"
    },
    subcommands: [{
            name: "add",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/sticky_roles add",
                    description: "Add a role to be kept when a member rejoins the server.",
                    usageExample: "/sticky_roles add (role)"
                },
                permission: "settings.sticky_roles.add"
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
                if (server.settings.sticky_roles.find((val) => role != null && val == role.id)) {
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
                server.addStickyRole(role.id);
                let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                successEmbed.title = "📝 Added Sticky Role"
                successEmbed.description = `Added <@&${role.id}> to the sticky roles.`;
                return await interaction.reply({ embeds: [successEmbed] });
            }
        },
        {
            name: "remove",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/sticky_roles remove",
                    description: "Remove a role that is kept when a member rejoins the server. If you've deleted the role, use the index parameter, which is the placement of the item on /sticky_roles list.",
                    usageExample: "/sticky_roles remove [role] [index]"
                },
                permission: "settings.sticky_roles.remove"
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
                let stickyRole = role != null ? server.settings.sticky_roles.find((val) => role != null && val == role.id) : index ? server.settings.sticky_roles[index-1] : undefined;
                if (!stickyRole) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "This join role doesn't exist!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }
                server.removeStickyRole(server.settings.sticky_roles.indexOf(stickyRole));
                let successEmbed = Embeds.SUCCESS_EMBED.toJSON();
                successEmbed.title = "📝 Removed Sticky Role"
                successEmbed.description = `Removed <@&${stickyRole}> from the sticky roles.`;
                return await interaction.reply({ embeds: [successEmbed] });
            }
        },
        {
            name: "list",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/sticky_roles list",
                    description: "List the roles that are kept when a member rejoins the server.",
                    usageExample: "/sticky_roles list"
                },
                permission: "settings.sticky_roles.list"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
                let server = await Server.findOrCreateServer(interaction.guild.id);
                let successEmbed = Embeds.INFO_EMBED.toJSON();
                successEmbed.title = "📝 Sticky Roles"
                successEmbed.description = server.settings.sticky_roles.reduce((accumulator, value, index) => `${accumulator}\n**${index+1})** <@&${value}>`, "");
                return await interaction.reply({ embeds: [successEmbed] });
            }
        }],
    async execute() {
        return;
    },
}
module.exports = stickyRolesCommand;