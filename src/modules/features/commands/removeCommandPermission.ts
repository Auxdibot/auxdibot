import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

export async function removeCommandPermission(
   auxdibot: Auxdibot,
   guildID: string,
   commandName: string,
   subcommand: string[],
) {
   const server = await findOrCreateServer(auxdibot, guildID);
   if (!server) return;
   const permission = server.command_permissions.findIndex(
      (cp) =>
         cp.command == commandName &&
         (subcommand.length > 1
            ? cp.group == subcommand[0] && cp.subcommand == subcommand[1]
            : subcommand.length == 1
            ? cp.subcommand == subcommand[0]
            : !cp.group && !cp.subcommand),
   );
   if (permission == -1) return;
   const removed = server.command_permissions.splice(permission, 1);
   return auxdibot.database.servers
      .update({
         where: { serverID: guildID },
         data: { command_permissions: server.command_permissions },
      })
      .then(() => removed)
      .catch(() => undefined);
}
