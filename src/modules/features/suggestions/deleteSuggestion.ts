import { Auxdibot } from '@/Auxdibot';

export default async function deleteSuggestion(auxdibot: Auxdibot, serverID: string, suggestionID: number) {
   return await auxdibot.database.suggestions
      .delete({ where: { serverID_suggestionID: { serverID, suggestionID } } })
      .then((suggestion) => suggestion)
      .catch(() => undefined);
}
