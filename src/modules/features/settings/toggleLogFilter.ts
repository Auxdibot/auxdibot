import { Auxdibot } from '@/interfaces/Auxdibot';
import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function toggleLogFilter(auxdibot: Auxdibot, guild: Guild, log: LogAction) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { filtered_logs: true } })
      .then(async (data) => {
         if (data.filtered_logs.indexOf(log) == -1) data.filtered_logs.push(log);
         else if (data.filtered_logs.indexOf(log) != -1) data.filtered_logs.splice(data.filtered_logs.indexOf(log), 1);
         return auxdibot.database.servers
            .update({
               where: { serverID: guild.id },
               data: { filtered_logs: data.filtered_logs },
               select: { filtered_logs: true },
            })
            .then((data) => data.filtered_logs.indexOf(log) != -1);
      });
}
