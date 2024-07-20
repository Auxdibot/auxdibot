import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import { LevelReward, LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function createLevelReward(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   levelReward: LevelReward,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (!testLimit(server.level_rewards, Limits.LEVEL_REWARDS_DEFAULT_LIMIT))
      throw new Error('You have too many level rewards!');
   if (levelReward.level < 1) throw new Error('You cannot specify a level reward for a level less than 1!');
   return await auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { level_rewards: true },
         data: { level_rewards: { push: levelReward } },
      })
      .then((data) => {
         handleLog(auxdibot, guild, {
            type: LogAction.LEVEL_REWARD_CREATED,
            userID: user.id,
            date_unix: Date.now(),
            description: `Added ${
               guild.roles.cache.get(levelReward.roleID)?.name ?? 'a role'
            } as the level reward for Level ${levelReward.level}`,
         });
         return data;
      })
      .catch(() => {
         throw new Error('An error occurred attempting to add this level reward to your server!');
      });
}
