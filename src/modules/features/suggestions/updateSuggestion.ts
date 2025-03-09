import { Auxdibot } from '@/Auxdibot';
import { Prisma } from '@prisma/client';

export default async function updateSuggestion(
   auxdibot: Auxdibot,
   serverID: string,
   suggestionID: number,
   suggestion: Prisma.suggestionsUpdateInput,
) {
   return await auxdibot.database.suggestions
      .update({
         where: { serverID_suggestionID: { serverID: serverID, suggestionID: suggestionID } },
         data: suggestion,
      })
      .then(() => suggestion)
      .catch(() => undefined);
}
