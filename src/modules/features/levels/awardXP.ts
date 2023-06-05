import { Auxdibot } from '@/interfaces/Auxdibot';
import calcXP from '@/util/calcXP';

export default async function awardXP(auxdibot: Auxdibot, serverID: string, userID: string, xp: number) {
   const member = await auxdibot.database.servermembers.upsert({
      where: { serverID_userID: { serverID, userID } },
      update: {},
      create: { serverID, userID },
   });
   member.xp += xp;
   member.xpTill += xp;
   while (member.xpTill >= calcXP(member.level)) {
      (member.xpTill -= calcXP(member.level)), member.level++;
   }
   return await auxdibot.database.servermembers
      .update({
         where: { serverID_userID: { serverID, userID } },
         data: { xp: member.xp, xpTill: member.xpTill, level: member.level },
      })
      .then(() => member.level)
      .catch(() => undefined);
}
