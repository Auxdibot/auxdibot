import { Auxdibot } from '@/interfaces/Auxdibot';
import { Suggestion } from '@prisma/client';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

export default async function updateSuggestion(auxdibot: Auxdibot, serverID: string, suggestion: Suggestion) {
   const server = await findOrCreateServer(auxdibot, serverID);
   let findSuggestion = server.suggestions.find((i) => i.suggestionID == suggestion.suggestionID);
   if (findSuggestion) return undefined;
   findSuggestion = suggestion;
   return await auxdibot.database.servers
      .update({ where: { serverID }, data: { suggestions: server.suggestions } })
      .then(() => suggestion)
      .catch(() => undefined);
}
