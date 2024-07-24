import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function generateLevelLeaderboard(auxdibot: Auxdibot, serverID: string, limit = 1000, start = 0) {
   const members = await auxdibot.database.servermembers.findMany({
      where: { serverID, in_server: true },
      orderBy: { xp: 'desc' },
      take: limit,
      skip: start,
   });
   return members;
}
