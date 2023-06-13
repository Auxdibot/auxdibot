import { Auxdibot } from '@/interfaces/Auxdibot';
import { Log } from '@prisma/client';

export default async function updateLog(auxdibot: Auxdibot, serverID: string, log: Log) {
   return auxdibot.database.servers
      .update({ where: { serverID }, data: { latest_log: log } })
      .then(() => log)
      .catch(() => undefined);
}
