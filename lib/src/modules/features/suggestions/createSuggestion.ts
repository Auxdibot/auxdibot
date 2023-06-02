import { Auxdibot } from '@/interfaces/Auxdibot';
import { Suggestion } from '@prisma/client';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { testLimit } from '@/util/testLimit';
import Limits from '@/constants/database/Limits';

export default async function createSuggestion(auxdibot: Auxdibot, serverID: string, suggestion: Suggestion) {
   const server = await findOrCreateServer(auxdibot, serverID);
   if (server.suggestions.find((i) => i.suggestionID == suggestion.suggestionID)) return undefined;
   if (testLimit(server.suggestions, Limits.ACTIVE_SUGGESTIONS_DEFAULT_LIMIT, true) == 'spliced') {
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { suggestions: server.suggestions },
      });
   }
   return await auxdibot.database.servers
      .update({ where: { serverID }, data: { suggestions: { push: suggestion } } })
      .then(() => suggestion)
      .catch(() => undefined);
}
