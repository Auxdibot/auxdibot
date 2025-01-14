import { Auxdibot } from '@/Auxdibot';
import { Prisma, punishments } from '@prisma/client';

export async function getServerPunishments(
   auxdibot: Auxdibot,
   serverID: string,
   opts: Omit<Prisma.punishmentsWhereInput, 'serverID'> = {},
   limit?: number,
   orderBy?: Omit<Prisma.punishmentsOrderByWithRelationInput, 'serverID'>,
): Promise<punishments[] | undefined> {
   return await auxdibot.database.punishments
      .findMany({
         where: { serverID, ...opts },
         orderBy: orderBy ?? { date: 'desc' },
         take: limit,
      })
      .then((punishments) => {
         return punishments;
      })
      .catch(() => undefined);
}
