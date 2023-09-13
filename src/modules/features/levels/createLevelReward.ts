import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { testLimit } from '@/util/testLimit';
import { LevelReward } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function createLevelReward(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   levelReward: LevelReward,
) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { level_rewards: true } })
      .then(async (i) => {
         if (!testLimit(i.level_rewards, Limits.LEVEL_REWARDS_DEFAULT_LIMIT))
            throw new Error('you have too many level rewards');
         return await auxdibot.database.servers.update({
            where: { serverID: guild.id },
            select: { serverID: true, suggestions_reactions: true },
            data: { level_rewards: { push: levelReward } },
         });
      });
}
