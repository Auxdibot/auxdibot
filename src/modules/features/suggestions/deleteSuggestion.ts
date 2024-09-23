import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

export default async function deleteSuggestion(auxdibot: Auxdibot, serverID: string, suggestionID: number) {
   const server = await findOrCreateServer(auxdibot, serverID);
   const suggestion = server.suggestions.splice(
      server.suggestions.indexOf(server.suggestions.find((sugg) => sugg.suggestionID == suggestionID)),
      1,
   );
   if (!suggestion) return undefined;
   return await auxdibot.database.servers
      .update({ where: { serverID }, data: { suggestions: server.suggestions } })
      .then(() => suggestion)
      .catch(() => undefined);
}
