import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function deleteServer(
   auxdibot: Auxdibot,
   serverID: string,
): Promise<{ serverDeleted: boolean; membersDeleted: boolean; totalsDeleted: boolean; cardDeleted: boolean }> {
   // Free up assets

   await auxdibot.database.servers
      .findFirst({ where: { serverID } })
      .then(async (server) => {
         if (server?.notifications) {
            server.notifications.forEach((i) => auxdibot.subscriber.removeGuild(i.topicURL, serverID, auxdibot));
         }
      })
      .catch(() => undefined);

   // Delete server data

   const serverDeleted = await auxdibot.database.servers
      .deleteMany({ where: { serverID } })
      .then(() => true)
      .catch(() => false);
   const cardDeleted = await auxdibot.database.servercards
      .deleteMany({ where: { serverID } })
      .then(() => true)
      .catch(() => false);
   const totalsDeleted = await auxdibot.database.totals
      .deleteMany({ where: { serverID } })
      .then(() => true)
      .catch(() => false);
   const membersDeleted = await auxdibot.database.servermembers
      .deleteMany({ where: { serverID } })
      .then(() => true)
      .catch(() => false);
   return { serverDeleted, membersDeleted, totalsDeleted, cardDeleted };
}
