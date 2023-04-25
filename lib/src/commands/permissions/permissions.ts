import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import Command from "../../util/templates/Command";
import Embeds from '../../util/constants/Embeds';
import Server from "../../mongo/model/Server";
import {IPermissionOverride} from "../../mongo/schema/PermissionOverride";
import {LogType} from "../../mongo/schema/Log";

const permissionsCommand = <Command>{
    data: new SlashCommandBuilder()
        .setName('permissions')
        .setDescription('Edit, view, or delete permissions and permission overrides.')
        .addSubcommand(subcommand => subcommand
            .setName('list')
            .setDescription('List all overrides.'))
        .addSubcommand(subcommand => subcommand
            .setName('delete')
            .setDescription('Delete an override using the override id.')
            .addNumberOption(builder => builder.setName('override_id')
                .setDescription('The override id to delete.')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('view')
            .setDescription('View an override using the override id.')
            .addNumberOption(builder => builder.setName('override_id')
                .setDescription('The override id to view.')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('create')
            .setDescription('Create an override.')
            .addStringOption(builder => builder.setName('permission')
                .setDescription('The permission to add.')
                .setRequired(true))
            .addBooleanOption(builder => builder.setName('allowed')
                .setDescription('Whether the user is allowed to use this permission.')
                .setRequired(true))
            .addRoleOption(builder => builder.setName('role')
                .setDescription('The role id to view.'))
            .addUserOption(builder => builder.setName('user')
                .setDescription('The user id to view.'))
            ),
    info: {
        help: {
            commandCategory: "Permissions",
            name: "/permissions",
            description: "Edit, view, delete or list permission overrides.",
            usageExample: "/permissions [view|create|delete|list]"
        },
        permission: "permissions"
    },
    subcommands: [{
        name: "view",
        info: {
            help: {
                commandCategory: "Permissions",
                name: "/permissions view",
                description: "Edit, view, or delete permission overrides.",
                usageExample: "/permissions view [override_id]"
            },
            permission: "permissions.view"
        },
        async execute(interaction: ChatInputCommandInteraction) {
            if (!interaction.guild) return;
            let server = await Server.findOrCreateServer(interaction.guild.id);
            let override_id = interaction.options.getNumber("override_id");
            if (override_id) {
                let permission = server.permission_overrides[override_id - 1];
                if (permission) {
                    let embed = Embeds.SUCCESS_EMBED.toJSON();
                    embed.title = `✋ Permission Override (OID: ${override_id + 1})`;
                    embed.description = "";
                    embed.fields = [{
                        name: "Permission Override",
                        value: `${permission.allowed ? "✅" : "❎"} \`${permission.permission}\` - ${permission.role_id ? `<@&${permission.role_id}>` : permission.user_id ? `<@${permission.user_id}>` : ""}`
                    }];
                    return await interaction.reply({ embeds: [embed] });
                }
            }
            let embed = Embeds.ERROR_EMBED.toJSON();
            embed.description = "Couldn't find that permission override!";
            return await interaction.reply({ embeds: [embed] })
        }
    },
        {
            name: "create",
            info: {
                help: {
                    commandCategory: "Permissions",
                    name: "/permissions create",
                    description: "Create a permission override",
                    usageExample: "/permissions create (permission) (role|user) (allowed)"
                },
                permission: "permissions.create"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
                const user = interaction.options.getUser('user'),
                    permission = interaction.options.getString('permission'),
                    role = interaction.options.getRole('role'),
                    allowed = interaction.options.getBoolean('allowed');
                let server = await Server.findOrCreateServer(interaction.guild.id);
                if (!permission || allowed == null || (!role && !user)) {
                    let errorEmbed = Embeds.ERROR_EMBED.toJSON();
                    errorEmbed.description = "No arguments provided!";
                    return await interaction.reply({ embeds: [errorEmbed] });
                }

                let permissionOverride = <IPermissionOverride>{
                    user_id: user ? user.id : undefined,
                    role_id: role ? role.id : undefined,
                    permission: permission,
                    allowed,
                };
                server.addPermissionOverride(permissionOverride);
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "✋ Added Permission Override"
                embed.description = `Created a new permission override for ${permissionOverride.user_id ? `<@${permissionOverride.user_id}>` : permissionOverride.role_id ? `<@&${permissionOverride.role_id}>` : "None"} for permission \`${permissionOverride.permission}\``
                embed.fields = [{
                    name: `Permission Override (OID: ${server.permission_overrides.length})`,
                    value: `${allowed ? "✅" : "❎"} \`${permissionOverride.permission}\` - ${permissionOverride.role_id ? `<@&${permissionOverride.role_id}>` : permissionOverride.user_id ? `<@${permissionOverride.user_id}>` : ""}`
                }];
                await server.log({
                    type: LogType.PERMISSION_CREATED,
                    permission_override: permissionOverride,
                    date_unix: Date.now(),
                    user_id: interaction.user.id,
                    description: `${interaction.user.tag} created a permission override. (OID: ${server.permission_overrides.length})`
                }, interaction.guild);

                return await interaction.reply({ embeds: [embed] });
            }
        },
        {
            name: "delete",
            info: {
                help: {
                    commandCategory: "Permissions",
                    name: "/permissions delete",
                    description: "Delete a permission override.",
                    usageExample: "/permissions delete [override_id]"
                },
                permission: "permissions.delete"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
                let server = await Server.findOrCreateServer(interaction.guild.id);
                let override_id = interaction.options.getNumber("override_id");
                if (override_id) {
                    let permission = server.permission_overrides[override_id - 1];
                    if (permission) {
                        server.removePermissionOverride(override_id-1);
                        let embed = Embeds.SUCCESS_EMBED.toJSON();
                        embed.title = "✋ Deleted Permission Override";
                        embed.description = `Deleted permission override with override id \`${override_id}\`.`
                        embed.fields = [{
                            name: "Permission Override",
                            value: `${permission.allowed ? "✅" : "❎"} \`${permission.permission}\` - ${permission.role_id ? `<@&${permission.role_id}>` : permission.user_id ? `<@${permission.user_id}>` : ""}`
                        }];
                        await server.log({
                            type: LogType.PERMISSION_DELETED,
                            permission_override: permission,
                            date_unix: Date.now(),
                            user_id: interaction.user.id,
                            description: `${interaction.user.tag} deleted a permission override. (OID: ${override_id})`
                        }, interaction.guild);
                        return await interaction.reply({ embeds: [embed] });
                    }
                }
                let embed = Embeds.ERROR_EMBED.toJSON();
                embed.description = "Couldn't find that permission override!";
                return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] })
            }
        },
        {
            name: "list",
            info: {
                help: {
                    commandCategory: "Permissions",
                    name: "/permissions list",
                    description: "List all permission overrides.",
                    usageExample: "/permissions list"
                },
                permission: "permissions.list"
            },
            async execute(interaction: ChatInputCommandInteraction) {
                if (!interaction.guild) return;
                let server = await Server.findOrCreateServer(interaction.guild.id);
                let embed = Embeds.DEFAULT_EMBED.toJSON();
                embed.title = "✋ Permission Overrides";
                embed.description = "Use the OID to delete or view a permission override."
                embed.fields = [{
                    name: `Permission Overrides for ${interaction.guild.name}`,
                    value: server.permission_overrides.reduce((accumulator, permissionOverride, index) => accumulator + `\n**OID ${index + 1}**) ${permissionOverride.allowed ? "✅" : "❎"} \`${permissionOverride.permission}\` - ${permissionOverride.role_id ? `<@&${permissionOverride.role_id}>` : permissionOverride.user_id ? `<@${permissionOverride.user_id}>` : ""}`, "")
                }];
                return await interaction.reply({ embeds: [embed] });
            }
        }],
    async execute() {
        return;
    },

}
module.exports = permissionsCommand;