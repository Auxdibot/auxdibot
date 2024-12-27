import { Auxdibot } from '@/Auxdibot';
import { Prisma, punishments } from '@prisma/client';

export async function getServerPunishments(
   auxdibot: Auxdibot,
   serverID: string,
   opts: Omit<Prisma.punishmentsWhereInput, 'serverID'> = {},
   limit?: number,
): Promise<punishments[] | undefined> {
   return await auxdibot.database.punishments
      .findMany({
         where: { serverID, ...opts },
         orderBy: { date: 'desc' },
         take: limit,
      })
      .then((punishments) => {
         return punishments;
      })
      .catch(() => undefined);
}
