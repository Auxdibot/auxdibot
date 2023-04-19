import {
    Channel,
    ChatInputCommandInteraction,
    GuildMember,
    GuildMemberRoleManager,
    Role,
    SlashCommandBuilder
} from "discord.js";
import Command from "../../util/templates/Command";
import Embeds from "../../util/constants/Embeds";
import Server from "../../mongo/model/Server";
import {LogType} from "../../mongo/schema/Log";

const settingsCommand = <Command>{
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Change settings for the server.')
        .addSubcommand(builder => builder.setName('log_channel').setDescription('Change the log channel for this server.').addChannelOption(builder => builder.setName('channel')
            .setDescription('The log channel to be set.')
            .setRequired(true)))
        .addSubcommand(builder => builder.setName('mute_role').setDescription('Change the mute role for this server.').addRoleOption(builder => builder.setName('role')
            .setDescription('The mute role to be set.')
            .setRequired(true)))
        .addSubcommand(builder => builder.setName("view").setDescription("View this server's settings.")),
    info: {
        help: {
            commandCategory: "Settings",
            name: "/settings",
            description: "Change settings for the server.",
            usageExample: "/settings (view|log_channel|mute_role)"
        },
        permission: "settings"
    },
    subcommands: [{
        name: "view",
        info: {
            help: {
                commandCategory: "Settings",
                name: "/settings view",
                description: "View all settings for the server.",
                usageExample: "/settings view"
            },
            permission: "settings.view"
        },
        async execute(interaction: ChatInputCommandInteraction) {
            if (!interaction.guild) return;
            let server = await Server.findOrCreateServer(interaction.guild.id);
            let embed = Embeds.INFO_EMBED.toJSON();
            embed.title = "⚙️ Server Settings";
            embed.description = `🗒️ Log Channel: ${server.settings.log_channel ? `<#${server.settings.log_channel}>` : "None"}\r\n🎤 Mute Role: ${server.settings.mute_role ? `<@&${server.settings.mute_role}>` : "None"}`
            return await interaction.reply({ embeds: [embed] })
        }
    },{
        name: "log_channel",
        info: {
            help: {
                commandCategory: "Settings",
                name: "/settings log_channel",
                description: "Change the log channel for the server, where all actions are logged to.",
                usageExample: "/settings log_channel (channel)"
            },
            permission: "settings.log_channel"
        },
        async execute(interaction: ChatInputCommandInteraction) {
            if (!interaction.guild) return;
            let server = await Server.findOrCreateServer(interaction.guild.id);
            const channel: Channel | null = interaction.options.getChannel('channel');
            if (!channel) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
            if (!channel.isTextBased() || channel.isDMBased() || channel.isThread() || channel.isVoiceBased()) {
                let error = Embeds.ERROR_EMBED.toJSON();
                error.description = "This isn't a text channel! Please set the log channel to be a Discord **Text Channel**.";
                return await interaction.reply({ embeds: [error] });
            }
            let embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = "⚙️ Log Channel Change";

            let formerChannel = interaction.guild.channels.resolve(server.settings.log_channel || "");
            if (channel.id == server.settings.log_channel) {
                embed.description = `Nothing changed. Log channel is the same as one specified in settings.`;
                return await interaction.reply({ embeds: [embed] });
            }
            server.setLogChannel(channel.id);
            embed.description = `The log channel for this server has been changed.\r\n\r\nFormerly: ${formerChannel ? `<#${formerChannel.id}>` : "None"}\r\n\r\nNow: ${channel}`;
            await server.log({
                type: LogType.LOG_CHANNEL_CHANGED,
                user_id: interaction.user.id,
                date_unix: Date.now(),
                description: "The log channel for this server has been changed.",
                log_channel: { former: formerChannel ? formerChannel.id : undefined, now: channel.id }
            }, interaction.guild);
            return await interaction.reply({ embeds: [embed] })
        }
    }, {
        name: "mute_role",
        info: {
            help: {
                commandCategory: "Settings",
                name: "/settings mute_role",
                description: "Change the mute role for the server, which is automatically assigned to muted users.",
                usageExample: "/settings mute_role (role)"
            },
            permission: "settings.mute_role"
        },
        async execute(interaction: ChatInputCommandInteraction) {
            if (!interaction.guild || !interaction.member) return;
            let server = await Server.findOrCreateServer(interaction.guild.id);
            const role = interaction.options.getRole('role');
            if (!role) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
            if ((interaction.member as GuildMember).id != interaction.guild.ownerId && interaction.guild.roles.comparePositions((interaction.member.roles as GuildMemberRoleManager).highest, role.id) <= 0) {
                let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
                noPermissionEmbed.title = "⛔ No Permission!"
                noPermissionEmbed.description = `This role is higher than yours!`
                return await interaction.reply({ embeds: [noPermissionEmbed] });
            }
            if (interaction.guild.roles.comparePositions((interaction.member.roles as GuildMemberRoleManager).highest, role.id) <= 0) {
                let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
                noPermissionEmbed.title = "⛔ No Permission!"
                noPermissionEmbed.description = `This role is higher up on the role hierarchy than Auxdibot's roles!`
                return await interaction.reply({ embeds: [noPermissionEmbed] });
            }
            let embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = "⚙️ Mute Role Change";

            let formerRole = interaction.guild.roles.resolve(server.settings.mute_role || "");
            if (role.id == server.settings.mute_role) {
                embed.description = `Nothing changed. Mute role is the same as one specified in settings.`;
                return await interaction.reply({ embeds: [embed] });
            }
            if (role instanceof Role) {
                await role.setPermissions([], "Clearing all permissions.")
                    .catch(() => {});
                interaction.guild.channels.cache.forEach(r => {
                    if (r.isDMBased() || r.isThread()) return;
                    r.permissionOverwrites.create(role, {
                        SendMessages: false,
                        SendMessagesInThreads: false,
                        AddReactions: false
                    })
                    if (r.isVoiceBased()) r.permissionOverwrites.create(role, {
                        Connect: false,
                    })
                });
            }
            await server.log({
                type: LogType.MUTE_ROLE_CHANGED,
                user_id: interaction.user.id,
                date_unix: Date.now(),
                description: "The mute role for this server has been changed.",
                mute_role: { former: formerRole ? formerRole.id : undefined, now: role.id }
            }, interaction.guild);
            server.setMuteRole(role.id);
            embed.description = `The mute role for this server has been changed.\r\n\r\nFormerly: ${formerRole ? `<@&${formerRole.id}>` : "None"}\r\n\r\nNow: ${role}`;
            return await interaction.reply({ embeds: [embed] })
        }
    }],
    async execute() {
        return;
    },
}
module.exports = settingsCommand;