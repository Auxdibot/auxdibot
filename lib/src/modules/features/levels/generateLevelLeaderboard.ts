import { Auxdibot } from '@/interfaces/Auxdibot';
import { servermembers } from '@prisma/client';
import { Collection, LimitedCollection } from 'discord.js';

export default async function generateLevelLeaderboard(auxdibot: Auxdibot, serverID: string, limit?: number) {
   const members = await auxdibot.database.servermembers.findMany({ where: { serverID } });
   const leaderboard = members
      .reduce((acc: Collection<servermembers, number>, member: servermembers) => {
         return acc.set(member, member.xp);
      }, new Collection())
      .sort((a, b) => b - a);
   return limit ? new LimitedCollection({ maxSize: limit }, leaderboard) : leaderboard;
}
