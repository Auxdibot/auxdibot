import { Auxdibot } from '@/interfaces/Auxdibot';

import { calculateLevel } from './calculateLevel';

export default async function takeXP(auxdibot: Auxdibot, serverID: string, userID: string, xp: number) {
   return await auxdibot.database.servermembers
      .update({
         where: { serverID_userID: { serverID, userID } },
         data: { xp: { decrement: xp } },
         select: { xp: true },
      })
      .then((member) => calculateLevel(member.xp))
      .catch(() => undefined);
}
