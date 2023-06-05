import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function deleteServer(
   auxdibot: Auxdibot,
   serverID: string,
): Promise<{ serverDeleted: boolean; membersDeleted: boolean; totalsDeleted: boolean }> {
   const serverDeleted = await auxdibot.database.servers
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
   return { serverDeleted, membersDeleted, totalsDeleted };
}
