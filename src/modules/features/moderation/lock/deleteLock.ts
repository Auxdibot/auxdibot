import { Auxdibot } from '../../../../interfaces/Auxdibot';
import { servers } from '@prisma/client';

export async function deleteLock(auxdibot: Auxdibot, server: servers, channelID: string) {
   const locked_channels = server.locked_channels;
   const locked = locked_channels.find((l) => l.channelID == channelID);
   if (locked) {
      locked_channels.splice(locked_channels.indexOf(locked), 1);
      return await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { locked_channels: locked_channels },
      });
   }
   return undefined;
}
