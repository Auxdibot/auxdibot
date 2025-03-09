import { Auxdibot } from '@/Auxdibot';
import { logs, Prisma } from '@prisma/client';

export async function getServerLogs(
   auxdibot: Auxdibot,
   serverID: string,
   opts: Omit<Prisma.logsWhereInput, 'serverID'> = {},
   limit?: number,
   orderBy?: Omit<Prisma.logsOrderByWithRelationInput, 'serverID'>,
): Promise<logs[] | undefined> {
   return await auxdibot.database.logs
      .findMany({
         where: { serverID, ...opts },
         orderBy: orderBy ?? { date: 'desc' },
         take: limit,
      })
      .then((logs) => {
         return logs;
      })
      .catch(() => undefined);
}
