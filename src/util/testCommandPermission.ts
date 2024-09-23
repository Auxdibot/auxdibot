import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Auxdibot } from '@/Auxdibot';
import { BaseInteraction, GuildMember, PermissionFlagsBits } from 'discord.js';
import { findCommand } from '@/modules/features/commands/findCommand';
import { CommandPermission } from '@prisma/client';
import { checkPermissionBypassRole } from './checkPermissionBypassRole';

export function testDiscordCommandPermissions(permissions: bigint[], member: GuildMember) {
   for (const permission of permissions) {
      if (!member.permissions.has(permission))
         return `noperm-${Object.keys(PermissionFlagsBits).find((i) => PermissionFlagsBits[i] == permission)}`;
   }

   return true;
}
/**
 * Tests the permission for a command.
 * @param permission - The command permission object.
 * @param interaction - The base interaction object.
 * @param member - The guild member object.
 * @returns Returns 'noperm' if the user doesn't have permission, 'noperm-channel' if the channel is blacklisted,
 * 'disabled' if the command is disabled, or `true` if the user has permission.
 */
export function testPermission(permission: CommandPermission, interaction: BaseInteraction, member: GuildMember) {
   if (permission.admin_only && !member.permissions.has(PermissionFlagsBits.Administrator)) return 'noperm';

   if (permission.blacklist_channels.includes(interaction.channel.id)) return 'noperm-channel';
   if (permission.channels.length > 0 && !permission.channels.includes(interaction.channel.id)) return 'noperm-channel';
   if (member.roles.cache.find((i) => permission.blacklist_roles.includes(i.id))) return 'noperm';
   if (permission.roles.length > 0 && !member.roles.cache.find((i) => permission.roles.includes(i.id))) return 'noperm';
   if (permission.disabled) return 'disabled';
   return true;
}
/**
 * Tests the permission of a command for a given user in a guild.
 * @param auxdibot - The Auxdibot instance.
 * @param interaction - The interaction object representing the command interaction.
 * @param guildID - The ID of the guild where the command is being executed.
 * @param command - The name of the command.
 * @param subcommand - Optional. An array of subcommand names, if applicable.
 * @returns A boolean indicating whether the user has permission to execute the command, or a string indicating the reason for lack of permission (notfound, noperm, disabled, noperm-channel).
 */
export async function testCommandPermission(
   auxdibot: Auxdibot,
   interaction: BaseInteraction,
   guildID: string,
   command: string,
   subcommand?: string[],
) {
   const server = await findOrCreateServer(auxdibot, guildID),
      member = interaction.guild ? interaction.guild.members.resolve(interaction.user.id) : null;
   if (!server || !member) return false;
   if (member.id == member.guild.ownerId || member.permissions.has(PermissionFlagsBits.Administrator)) return true;
   const data = findCommand(auxdibot, command, subcommand);
   if (!data) return 'notfound';
   const { commandData, subcommandData } = data;

   const permission = server.command_permissions.filter((cp) => cp.command == command),
      commandPermission = permission.find((i) => !i.subcommand && !i.group),
      groupPermission = permission.find(
         (i) => i.group == (subcommand.length > 1 ? subcommand[0] : undefined) && !i.subcommand,
      ),
      subcommandPermission = permission.find(
         (i) =>
            i.group == (subcommand.length > 1 ? subcommand[0] : undefined) &&
            i.subcommand == (subcommand.length > 1 ? subcommand[1] : subcommand[0]),
      );

   const allowedDefault = subcommandData ? subcommandData.info.allowedDefault : commandData.info.allowedDefault;

   const permissions =
      subcommandData?.info?.permissionsRequired !== undefined
         ? subcommandData.info.permissionsRequired
         : commandData.info.permissionsRequired;
   const checkPermissionBypass = await checkPermissionBypassRole(
      auxdibot,
      member,
      command,
      subcommand.length > 1 ? subcommand[0] : undefined,
      subcommand.length > 1 ? subcommand[1] : subcommand[0],
   );

   if (
      permissions &&
      permissions.length > 0 &&
      allowedDefault !== false &&
      !member.permissions.has(PermissionFlagsBits.Administrator) &&
      checkPermissionBypass !== true
   ) {
      const permissionTest = testDiscordCommandPermissions(permissions, member);
      if (permissionTest !== true) return permissionTest;
   }
   if (!commandPermission && !groupPermission && !subcommandPermission) {
      return allowedDefault !== false ? true : 'noperm';
   }
   let result: string | boolean = true;
   const commandTest = commandPermission ? testPermission(commandPermission, interaction, member) : null,
      groupTest = groupPermission ? testPermission(groupPermission, interaction, member) : null,
      subcommandTest = subcommandPermission ? testPermission(subcommandPermission, interaction, member) : null;
   if (subcommandTest !== true && subcommandTest !== null) {
      result = subcommandTest;
   }
   if (groupTest !== true && groupTest !== null) {
      result = groupTest;
   }
   if (commandTest !== true && commandTest !== null) {
      result = commandTest;
   }
   return result;
}
