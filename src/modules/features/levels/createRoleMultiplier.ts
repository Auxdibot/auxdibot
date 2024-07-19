import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import { LogAction, Multiplier } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function createRoleMultiplier(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   multiplier: Multiplier,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (!testLimit(server.role_multipliers, Limits.MULTIPLIER_DEFAULT_LIMIT))
      throw new Error('You have too many role multipliers!');
   if (isNaN(multiplier.multiplier)) throw new Error('You must provide a valid multiplier!');
   if (multiplier.multiplier < 0 || multiplier.multiplier > 999)
      throw new Error('You must provide a multiplier between 0 and 999!');
   if (server.role_multipliers.find((i) => i.id == multiplier.id))
      throw new Error('You already have a multiplier setup for that role!');
   return await auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { level_rewards: true },
         data: { channel_multipliers: { push: multiplier } },
      })
      .then((data) => {
         handleLog(auxdibot, guild, {
            type: LogAction.MULTIPLIER_CREATED,
            userID: user.id,
            date_unix: Date.now(),
            description: `Created a role multiplier for <@&${multiplier.id}> with a multiplier of \`x${multiplier.multiplier}\`.`,
         });
         return data;
      })
      .catch(() => {
         throw new Error('An error occurred attempting to add this multiplier to your server!');
      });
}
