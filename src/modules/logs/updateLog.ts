import { Prisma } from '@prisma/client';
import { Auxdibot } from '@/Auxdibot';
import Limits from '@/constants/database/Limits';
import { Guild } from 'discord.js';
import { getServerLogs } from '../features/logging/getServerLogs';

export default async function addLog(auxdibot: Auxdibot, guild: Guild, log: Prisma.logsCreateInput) {
   const logs = await auxdibot.database.logs.count({ where: { serverID: guild.id } }).catch(() => 0);
   const limit = await auxdibot.getLimit(Limits.LOGGING_LIMIT, guild);
   if (logs >= limit) {
      const toDelete = logs - limit + 1;
      const sorted = await getServerLogs(auxdibot, guild.id, undefined, toDelete, { date: 'asc' });
      if (sorted.length > 0)
         await auxdibot.database.logs
            .deleteMany({ where: { serverID: guild.id, id: { in: sorted.map((i) => i.id) } } })
            .catch(() => undefined);
   }
   return auxdibot.database.logs.create({ data: log }).catch(() => undefined);
}
