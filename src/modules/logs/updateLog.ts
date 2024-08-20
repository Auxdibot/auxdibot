import { Log } from '@prisma/client';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '../server/findOrCreateServer';
import { testLimit } from '@/util/testLimit';
import Limits from '@/constants/database/Limits';

// TODO: this is terrible bandaid code but I need to account for old data to honor older log dates
export default async function updateLog(auxdibot: Auxdibot, serverID: string, log: Omit<Log, 'old_date_unix'>) {
   return await findOrCreateServer(auxdibot, serverID)
      .then((data) => {
         const logs = Array(...data.logs);
         if (!testLimit(logs, Limits.LOGGING_LIMIT, true)) return;
         logs.push({ ...log, old_date_unix: null });
         return auxdibot.database.servers.update({ where: { serverID }, data: { logs } });
      })
      .catch(() => undefined);
}
