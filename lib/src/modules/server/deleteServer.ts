import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function deleteServer(
   auxdibot: Auxdibot,
   serverID: string,
): Promise<{ serverDeleted: boolean; membersDeleted: boolean }> {
   const serverDeleted = await auxdibot.database.servers
      .delete({ where: { serverID } })
      .then(() => true)
      .catch(() => false);
   const membersDeleted = await auxdibot.database.servermembers
      .deleteMany({ where: { serverID } })
      .then(() => true)
      .catch(() => false);
   return { serverDeleted, membersDeleted };
}
