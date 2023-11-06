import { Log } from '@prisma/client';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '../server/findOrCreateServer';
import { testLimit } from '@/util/testLimit';
import Limits from '@/constants/database/Limits';

export default async function updateLog(auxdibot: Auxdibot, serverID: string, log: Log) {
   return await findOrCreateServer(auxdibot, serverID)
      .then((data) => {
         const logs = Array(...data.logs);
         if (!testLimit(logs, Limits.LOGGING_LIMIT, true)) return;
         logs.push(log);
         return auxdibot.database.servers.update({ where: { serverID }, data: { logs } });
      })
      .catch(() => undefined);
}
