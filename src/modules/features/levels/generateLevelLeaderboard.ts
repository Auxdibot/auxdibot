import { Auxdibot } from '@/interfaces/Auxdibot';
import { servermembers } from '@prisma/client';

export default async function generateLevelLeaderboard(auxdibot: Auxdibot, serverID: string, limit?: number) {
   const members = await auxdibot.database.servermembers.findMany({ where: { serverID, in_server: true } });
   let leaderboard = members
      .reduce((acc: servermembers[], member: servermembers) => {
         acc.push(member);
         return acc;
      }, [])
      .sort((a, b) => b.xp - a.xp);
   if (limit) leaderboard = leaderboard.slice(0, limit ? limit : undefined);
   return leaderboard;
}
