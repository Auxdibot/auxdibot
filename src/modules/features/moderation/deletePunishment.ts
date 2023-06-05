import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

export default async function deletePunishment(auxdibot: Auxdibot, serverID: string, punishmentID: number) {
   const server = await findOrCreateServer(auxdibot, serverID);
   const punishment = server.punishments.splice(
      server.punishments.indexOf(server.punishments.find((sugg) => sugg.punishmentID == punishmentID)),
      1,
   );
   if (!punishment) return undefined;
   return await auxdibot.database.servers
      .update({ where: { serverID }, data: { punishments: server.punishments } })
      .then(() => punishment)
      .catch(() => undefined);
}
