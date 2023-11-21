import { Auxdibot } from '../../../../interfaces/Auxdibot';
import { ChannelLock, servers } from '@prisma/client';

export async function createLock(auxdibot: Auxdibot, server: servers, lock: ChannelLock) {
   const locked_channels = server.locked_channels;
   if (locked_channels.find((l) => l.channelID == lock.channelID)) {
      locked_channels.splice(locked_channels.indexOf(lock), 1);
   }
   locked_channels.push(lock);
   return await auxdibot.database.servers.update({
      where: { serverID: server.serverID },
      data: { locked_channels: locked_channels },
   });
}
