import { Auxdibot } from '@/Auxdibot';
import { Prisma, suggestions } from '@prisma/client';
import Limits from '@/constants/database/Limits';
import { getServerSuggestions } from './getServerSuggestions';

export default async function createSuggestion(
   auxdibot: Auxdibot,
   serverID: string,
   suggestion: Prisma.suggestionsCreateInput,
): Promise<suggestions | undefined> {
   const guild = await auxdibot.guilds.fetch(serverID).catch(() => undefined);
   const suggestions = await getServerSuggestions(auxdibot, serverID, { suggestionID: suggestion.suggestionID });
   if (suggestions.length > 0) return undefined;
   const suggestionsCount = await auxdibot.database.suggestions.count({ where: { serverID: guild.id } }).catch(() => 0);
   const limit = await auxdibot.getLimit(Limits.ACTIVE_SUGGESTIONS_DEFAULT_LIMIT, guild);
   if (suggestionsCount >= limit) {
      const toDelete = suggestionsCount - limit + 1;
      const sorted = await getServerSuggestions(auxdibot, guild.id, undefined, toDelete, { date: 'asc' });
      if (sorted.length > 0)
         await auxdibot.database.logs
            .deleteMany({ where: { serverID: guild.id, id: { in: sorted.map((i) => i.id) } } })
            .catch(() => undefined);
   }
   auxdibot.database.analytics
      .upsert({
         where: { botID: auxdibot.user.id },
         create: { botID: auxdibot.user.id },
         update: { suggestions: { increment: 1 } },
      })
      .catch(() => undefined);
   return await auxdibot.database.suggestions
      .create({ data: suggestion })
      .then((sugg) => sugg)
      .catch(() => undefined);
}
