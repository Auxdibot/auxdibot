import { Auxdibot } from '@/Auxdibot';
import { calculateLevel } from './calculateLevel';

export default async function awardXP(auxdibot: Auxdibot, serverID: string, userID: string, xp: number) {
   return await auxdibot.database.servermembers
      .upsert({
         where: { serverID_userID: { serverID, userID } },
         update: { xp: { increment: xp } },
         create: { serverID, userID, xp },
         select: { xp: true },
      })
      .then((member) => calculateLevel(member.xp))
      .catch(() => undefined);
}
