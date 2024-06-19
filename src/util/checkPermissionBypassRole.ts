import { Auxdibot } from '@/interfaces/Auxdibot';
import { findCommand } from '@/modules/features/commands/findCommand';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { GuildMember } from 'discord.js';

export async function checkPermissionBypassRole(
   auxdibot: Auxdibot,
   member: GuildMember,
   commandName: string,
   groupName?: string,
   subcommandName?: string,
) {
   const data = await findOrCreateServer(auxdibot, member.guild.id);

   const commandData = findCommand(
      auxdibot,
      commandName,
      [groupName, subcommandName].filter((i) => i),
   );
   if (!commandData) return false;
   const permission = data.command_permissions.filter((cp) => cp.command == commandName),
      commandPermission = permission.find((i) => !i.subcommand && !i.group),
      groupPermission = permission.find((i) => i.group == groupName && !i.subcommand),
      subcommandPermission = permission.find((i) => i.group == groupName && i.subcommand == subcommandName);

   if (
      member.roles.cache.find(
         (i) =>
            commandPermission?.permission_bypass_roles.includes(i.id) ||
            groupPermission?.permission_bypass_roles.includes(i.id) ||
            subcommandPermission?.permission_bypass_roles.includes(i.id),
      )
   )
      return true;
   return false;
}
