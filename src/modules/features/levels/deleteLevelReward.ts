import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function deleteLevelReward(auxdibot: Auxdibot, guild: Guild, user: { id: string }, id: number) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (server.level_rewards.length <= id) throw new Error('Invalid id provided.');

   server.level_rewards.splice(id, 1);
   return await auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { level_rewards: server.level_rewards },
         select: { level_rewards: true },
      })
      .then((data) => {
         auxdibot.log(guild, {
            type: LogAction.LEVEL_REWARD_DELETED,
            userID: user.id,
            date: new Date(),
            description: `Deleted level reward #${id + 1} from your server.`,
         });
         return data;
      });
}
