import { Log } from '@prisma/client';
import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function updateLog(auxdibot: Auxdibot, serverID: string, log: Log) {
   return await auxdibot.database.servers.update({ where: { serverID }, data: { latest_log: log } });
}
