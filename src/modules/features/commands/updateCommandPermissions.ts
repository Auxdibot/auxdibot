import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { CommandPermission } from '@prisma/client';
import { findCommand } from './findCommand';
import Limits from '@/constants/database/Limits';
import { removeCommandPermission } from './removeCommandPermission';

export async function updateCommandPermissions(
   auxdibot: Auxdibot,
   guildId: string,
   command: string,
   subcommand: string[],
   permissions: Partial<Omit<CommandPermission, 'command' | 'subcommand' | 'group'>>,
   remove?: boolean,
): Promise<CommandPermission | undefined> {
   const server = await findOrCreateServer(auxdibot, guildId);
   const guild = await auxdibot.guilds.fetch(guildId).catch(() => undefined);
   const cmd = findCommand(auxdibot, command, subcommand);
   if (!cmd) return undefined;

   let commandPermissions = server?.command_permissions.find(
      (i) =>
         i.command == command &&
         (subcommand.length > 1
            ? i.subcommand == subcommand[1] && i.group == subcommand[0]
            : i.subcommand == subcommand[0]),
   );
   if (!commandPermissions) {
      if (remove) throw new Error('Command permission rule not found.');
      commandPermissions = {
         command,
         subcommand: subcommand.length > 1 ? subcommand[1] : subcommand[0],
         group: subcommand.length > 1 ? subcommand[0] : undefined,
         blacklist_channels: [],
         roles: [],
         blacklist_roles: [],
         permission_bypass_roles: permissions.permission_bypass_roles || [],
         channels: [],
         channel_output: undefined,
         disabled: false,
         old_admin_only: null,
         ...permissions,
      };
      server?.command_permissions.push(commandPermissions);
   } else {
      for (const i in permissions) {
         if (
            !remove &&
            Array.isArray(permissions[i]) &&
            permissions[i].every((b) => commandPermissions[i]?.includes(b))
         )
            throw new Error(`You have already added these ${i.toLowerCase().replace('_', ' ')}.`);
      }
      Object.assign(commandPermissions, {
         ...permissions,
         permission_bypass_roles:
            (remove && permissions.permission_bypass_roles
               ? commandPermissions.permission_bypass_roles.filter(
                    (i) => !permissions.permission_bypass_roles.includes(i),
                 )
               : commandPermissions.permission_bypass_roles.concat(permissions.permission_bypass_roles ?? [])) ?? [],
         roles:
            (remove && permissions.roles
               ? commandPermissions.roles.filter((i) => !permissions.roles.includes(i))
               : commandPermissions.roles.concat(permissions.roles ?? [])) ?? [],
         channels:
            (remove && permissions.channels
               ? commandPermissions.channels.filter((i) => !permissions.channels.includes(i))
               : commandPermissions.channels.concat(permissions.channels ?? [])) ?? [],
         blacklist_channels:
            (remove && permissions.blacklist_channels
               ? commandPermissions.blacklist_channels.filter((i) => !permissions.blacklist_channels.includes(i))
               : commandPermissions.blacklist_channels.concat(permissions.blacklist_channels ?? [])) ?? [],
         blacklist_roles:
            (remove && permissions.blacklist_roles
               ? commandPermissions.blacklist_roles.filter((i) => !permissions.blacklist_roles.includes(i))
               : commandPermissions.blacklist_roles.concat(permissions.blacklist_roles ?? [])) ?? [],
      });
      if (
         Object.keys(commandPermissions).filter(
            (i) =>
               ['command', 'subcommand', 'group'].indexOf(i) == -1 &&
               commandPermissions[i] &&
               (Array.isArray(commandPermissions[i]) ? commandPermissions[i].length > 0 : true),
         ).length <= 0 &&
         !commandPermissions.disabled
      ) {
         await removeCommandPermission(auxdibot, guildId, command, subcommand).catch(() => undefined);
         return commandPermissions;
      }
   }

   if (
      !(await auxdibot.testLimit(
         commandPermissions.blacklist_channels,
         Limits.COMMAND_PERMISSIONS_ITEM_LIMIT,
         guild?.ownerId,
      ))
   )
      throw new Error('Blacklist channels limit reached.');
   if (!(await auxdibot.testLimit(commandPermissions.roles, Limits.COMMAND_PERMISSIONS_ITEM_LIMIT, guild?.ownerId)))
      throw new Error('Roles limit reached.');
   if (
      !(await auxdibot.testLimit(
         commandPermissions.blacklist_roles,
         Limits.COMMAND_PERMISSIONS_ITEM_LIMIT,
         guild?.ownerId,
      ))
   )
      throw new Error('Blacklist roles limit reached.');
   if (
      !(await auxdibot.testLimit(
         commandPermissions.permission_bypass_roles,
         Limits.COMMAND_PERMISSIONS_ITEM_LIMIT,
         guild?.ownerId,
      ))
   )
      throw new Error('Permission bypass roles limit reached.');
   if (!(await auxdibot.testLimit(commandPermissions.channels, Limits.COMMAND_PERMISSIONS_ITEM_LIMIT, guild?.ownerId)))
      throw new Error('Channels limit reached.');

   return await auxdibot.database.servers
      .update({
         where: { id: server.id },
         data: { command_permissions: server?.command_permissions },
      })
      .then(() => commandPermissions);
}
