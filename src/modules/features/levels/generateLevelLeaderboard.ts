import { Auxdibot } from '@/Auxdibot';
import { Guild } from 'discord.js';

export default async function generateLevelLeaderboard(auxdibot: Auxdibot, guild: Guild, limit = 1000, start = 0) {
   const members = await auxdibot.database.servermembers
      .findMany({
         where: { serverID: guild.id, in_server: true },
         orderBy: { xp: 'desc' },
         take: limit,
         skip: start,
         select: {
            userID: true,
            xp: true,
            in_server: true,
         },
      })
      .then(async (m) => {
         const remove = [];
         for (const i of m) {
            const member = await guild.members.fetch(i.userID).catch(() => undefined);
            if (!member || member.user.bot) {
               remove.push(i.userID);
               if (member.user.bot) {
                  auxdibot.database.servermembers.deleteMany({ where: { userID: i.userID } }).catch(() => undefined);
               } else {
                  auxdibot.database.servermembers
                     .delete({ where: { serverID_userID: { serverID: guild.id, userID: i.userID } } })
                     .catch(() => undefined);
               }
            }
         }
         return m.filter((i) => !remove.find((j) => j == i.userID));
      });
   return members;
}
