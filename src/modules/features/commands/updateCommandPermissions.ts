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
): Promise<CommandPermission | undefined> {
   const server = await findOrCreateServer(auxdibot, guildId);
   const cmd = findCommand(auxdibot, command, subcommand);
   if (!cmd) return undefined;
   const { commandData, subcommandData } = cmd;
   let commandPermissions = server?.command_permissions.find(
      (i) => i.command == command && i.subcommand == subcommand[0] && i.group == subcommand[1],
   );
   if (!commandPermissions) {
      commandPermissions = {
         command,
         subcommand: subcommand[0],
         group: subcommand[1],
         blacklist_channels: [],
         roles: [],
         blacklist_roles: [],
         permission_bypass_roles: [],
         channels: [],
         channel_output: undefined,
         admin_only:
            subcommandData?.info?.allowedDefault != undefined
               ? subcommandData.info.allowedDefault
               : commandData.info.allowedDefault,
         ...permissions,
      };
      server?.command_permissions.push(commandPermissions);
   } else {
      Object.assign(commandPermissions, permissions);
   }
   return await auxdibot.database.servers
      .update({
         where: { id: server.id },
         data: { command_permissions: server?.command_permissions },
      })
      .then(() => commandPermissions);
}
