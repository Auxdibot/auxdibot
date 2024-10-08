import { Auxdibot } from '@/Auxdibot';
import { CommandPermission } from '@prisma/client';
import { EmbedBuilder } from 'discord.js';

export function createCommandListEmbed(auxdibot: Auxdibot, commands: CommandPermission[]) {
   const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
   embed.title = 'Command Rules';
   embed.description = commands
      .map((command) => {
         return `**/${
            command.command +
            (command.group ? ` ${command.group}` : '') +
            (command.subcommand ? ` ${command.subcommand}` : '')
         }**${
            command.disabled
               ? '❌ *Disabled*'
               : `${
                    command.blacklist_channels.length
                       ? `\nBlacklisted Channels: ${command.blacklist_channels
                            .map((channel) => `<#${channel}>`)
                            .join(', ')}`
                       : ''
                 }${
                    command.channels.length
                       ? `\nRequired Channels: ${command.channels.map((channel) => `<#${channel}>`).join(', ')}`
                       : ''
                 }${
                    command.blacklist_roles.length
                       ? `\nBlacklisted Roles: ${command.blacklist_roles.map((role) => `<@&${role}>`).join(', ')}`
                       : ''
                 }${
                    command.roles.length
                       ? `\nRequired Roles: ${command.roles.map((role) => `<@&${role}>`).join(', ')}`
                       : ''
                 }${
                    command.permission_bypass_roles.length
                       ? `\nBypass Roles: ${command.permission_bypass_roles.map((role) => `<@&${role}>`).join(', ')}`
                       : ''
                 }${
                    command.discord_permissions.length
                       ? `\nDiscord Permission Requirements: ${command.discord_permissions
                            .map((permission) => `\`${permission}\``)
                            .join(', ')}`
                       : ''
                 }${command.channel_output ? `\nOutput Channel: <#${command.channel_output}>` : ''}`
         }`;
      })
      .join('\n\n');
   return embed;
}
