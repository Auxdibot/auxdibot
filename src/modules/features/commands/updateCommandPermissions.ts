import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { CommandPermission } from '@prisma/client';
import { findCommand } from './findCommand';

export async function updateCommandPermissions(
   auxdibot: Auxdibot,
   guildId: string,
   command: string,
   subcommand: string[],
   permissions: Partial<Omit<CommandPermission, 'command' | 'subcommand' | 'group'>>,
   remove?: boolean,
): Promise<CommandPermission | undefined> {
   const server = await findOrCreateServer(auxdibot, guildId);
   const cmd = findCommand(auxdibot, command, subcommand);
   if (!cmd) return undefined;
   const { commandData, subcommandData } = cmd;
   let commandPermissions = server?.command_permissions.find(
      (i) => i.command == command && i.subcommand == subcommand[0] && i.group == subcommand[1],
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
         admin_only:
            subcommandData?.info?.allowedDefault != undefined
               ? !subcommandData.info.allowedDefault
               : !commandData.info.allowedDefault,
         ...permissions,
      };
      server?.command_permissions.push(commandPermissions);
   } else {
      Object.assign(commandPermissions, {
         ...permissions,
         permission_bypass_roles:
            (remove
               ? commandPermissions.permission_bypass_roles.filter(
                    (i) => !permissions.permission_bypass_roles.includes(i),
                 )
               : commandPermissions.permission_bypass_roles.concat(permissions.permission_bypass_roles ?? [])) ?? [],
         roles:
            (remove
               ? commandPermissions.roles.filter((i) => !permissions.roles.includes(i))
               : commandPermissions.roles.concat(permissions.roles ?? [])) ?? [],
         channels:
            (remove
               ? commandPermissions.channels.filter((i) => !permissions.channels.includes(i))
               : commandPermissions.channels.concat(permissions.channels ?? [])) ?? [],
         blacklist_channels:
            (remove
               ? commandPermissions.blacklist_channels.filter((i) => !permissions.blacklist_channels.includes(i))
               : commandPermissions.blacklist_channels.concat(permissions.blacklist_channels ?? [])) ?? [],
         blacklist_roles:
            (remove
               ? commandPermissions.blacklist_roles.filter((i) => !permissions.blacklist_roles.includes(i))
               : commandPermissions.blacklist_roles.concat(permissions.blacklist_roles ?? [])) ?? [],
      });
   }
   return await auxdibot.database.servers
      .update({
         where: { id: server.id },
         data: { command_permissions: server?.command_permissions },
      })
      .then(() => commandPermissions);
}
