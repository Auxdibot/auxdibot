import { Auxdibot } from '@/Auxdibot';
import { Prisma, suggestions } from '@prisma/client';

export async function getServerSuggestions(
   auxdibot: Auxdibot,
   serverID: string,
   opts: Omit<Prisma.suggestionsWhereInput, 'serverID'> = {},
   limit?: number,
   orderBy?: Omit<Prisma.suggestionsOrderByWithRelationInput, 'serverID'>,
): Promise<suggestions[] | undefined> {
   return await auxdibot.database.suggestions
      .findMany({
         where: { serverID, ...opts },
         orderBy: orderBy ?? { date: 'desc' },
         take: limit,
      })
      .then((suggestions) => {
         return suggestions;
      })
      .catch(() => undefined);
}
