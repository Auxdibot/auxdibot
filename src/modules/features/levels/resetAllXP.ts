import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function resetAllXP(auxdibot: Auxdibot, serverID: string) {
   return await auxdibot.database.servermembers.updateMany({
      where: { serverID: serverID },
      data: { xp: 0, xpTill: 0, level: 0 },
   });
}
