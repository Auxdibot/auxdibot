import { Auxdibot } from '@/Auxdibot';
import { Prisma, starred_messages } from '@prisma/client';

export async function getServerStarboardMessages(
   auxdibot: Auxdibot,
   serverID: string,
   board?: string,
   opts: Omit<Prisma.starred_messagesWhereInput, 'serverID'> = {},
   limit?: number,
   orderBy?: Omit<Prisma.starred_messagesOrderByWithRelationInput, 'serverID'>,
): Promise<starred_messages[] | undefined> {
   return await auxdibot.database.starred_messages
      .findMany({
         where: { serverID, board, ...opts },
         orderBy: orderBy ?? { date: 'desc' },
         take: limit,
      })
      .then((starred_messages) => {
         return starred_messages;
      })
      .catch(() => undefined);
}
