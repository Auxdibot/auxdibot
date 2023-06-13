import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function resetXP(auxdibot: Auxdibot, serverID: string, userID: string) {
   return await auxdibot.database.servermembers.upsert({
      where: { serverID_userID: { serverID, userID } },
      update: { xp: 0, xpTill: 0, level: 0 },
      create: { serverID, userID },
   });
}
