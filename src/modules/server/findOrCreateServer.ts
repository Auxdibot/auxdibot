import { defaultServer } from '@/constants/database/defaultServer';
import { servers } from '@prisma/client';
import { Auxdibot } from '@/Auxdibot';
export default async function findOrCreateServer(auxdibot: Auxdibot, serverID: string): Promise<servers | undefined> {
   const current = Date.now();

   return await auxdibot.database.servers
      .upsert({ where: { serverID }, update: {}, create: { serverID, ...defaultServer } })
      .then((server) => {
         console.log('FETCH SERVER ' + serverID + ' ' + current + ' ' + (Date.now() - current));
         return server;
      })
      .catch(() => undefined);
}
