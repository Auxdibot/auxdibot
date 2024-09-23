import { Auxdibot } from '@/Auxdibot';

import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function setStarboardSelfStar(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   self_star?: boolean,
) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { self_star: true } })
      .then(async (data) => {
         return auxdibot.database.servers
            .update({
               where: { serverID: guild.id },
               select: { serverID: true, self_star: true },
               data: { self_star: self_star || !data.self_star },
            })
            .then(async (i) => {
               await auxdibot.log(guild, {
                  type: LogAction.STARBOARD_SETTINGS_CHANGED,
                  userID: user.id,
                  date: new Date(),
                  description: `The ability to self-star messages for this server has been changed. (Now: ${
                     i.self_star ? 'Enabled' : 'Disabled'
                  } from ${data.self_star ? 'Enabled' : 'Disabled'})`,
               });
               return i;
            });
      })
      .catch((x) => {
         console.error(x);
         throw new Error(
            'Woah! An unknown error occurred. Please contact the Auxdibot Support server to see if we can resolve this!',
         );
      });
}
