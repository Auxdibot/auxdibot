import { defaultServer } from '@/constants/database/defaultServer';
import { servers } from '@prisma/client';
import { Auxdibot } from './../../interfaces/Auxdibot';
export default async function findOrCreateServer(auxdibot: Auxdibot, serverID: string): Promise<servers | undefined> {
   return await auxdibot.database.servers
      .upsert({ where: { serverID }, update: {}, create: { serverID, ...defaultServer } })
      .catch(() => undefined);
}
