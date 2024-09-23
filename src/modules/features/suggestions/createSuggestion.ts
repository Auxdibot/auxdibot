import { Auxdibot } from '@/Auxdibot';
import { Suggestion } from '@prisma/client';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import Limits from '@/constants/database/Limits';

export default async function createSuggestion(auxdibot: Auxdibot, serverID: string, suggestion: Suggestion) {
   const server = await findOrCreateServer(auxdibot, serverID);
   const guild = await auxdibot.guilds.fetch(serverID).catch(() => undefined);
   if (server.suggestions.find((i) => i.suggestionID == suggestion.suggestionID)) return undefined;
   if (
      (await auxdibot.testLimit(
         server.suggestions,
         Limits.ACTIVE_SUGGESTIONS_DEFAULT_LIMIT,
         guild && guild.ownerId,
         true,
      )) == 'spliced'
   ) {
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { suggestions: server.suggestions },
      });
   }
   return await auxdibot.database.servers
      .update({ where: { serverID }, data: { suggestions: { push: suggestion } } })
      .then(() => suggestion)
      .catch((x) => console.log(x));
}
