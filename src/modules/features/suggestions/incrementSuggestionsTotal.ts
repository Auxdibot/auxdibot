import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function incrementSuggestionsTotal(
   auxdibot: Auxdibot,
   serverID: string,
): Promise<number | undefined> {
   return await auxdibot.database.totals
      .upsert({
         where: { serverID },
         update: { suggestions: { increment: 1 } },
         create: { serverID, punishments: 1, suggestions: 1 },
      })
      .then((totals) => totals.suggestions)
      .catch(() => undefined);
}
