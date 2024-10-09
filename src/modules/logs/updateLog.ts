import { Log } from '@prisma/client';
import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '../server/findOrCreateServer';
import Limits from '@/constants/database/Limits';
import { Guild } from 'discord.js';

// TODO: this is terrible bandaid code but I need to account for old data to honor older log dates
export default async function updateLog(auxdibot: Auxdibot, guild: Guild, log: Omit<Log, 'old_date_unix'>) {
   return await findOrCreateServer(auxdibot, guild.id)
      .then(async (data) => {
         const logs = Array(...data.logs);
         if (!(await auxdibot.testLimit(logs, Limits.LOGGING_LIMIT, guild, true))) return;
         logs.push({ ...log, old_date_unix: null });
         return auxdibot.database.servers.update({ where: { serverID: guild.id }, data: { logs } });
      })
      .catch(() => undefined);
}
