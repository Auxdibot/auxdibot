import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function setStarboardStarring(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   starboard_star?: boolean,
) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { starboard_star: true } })
      .then(async (data) => {
         return auxdibot.database.servers
            .update({
               where: { serverID: guild.id },
               select: { serverID: true, starboard_star: true },
               data: { starboard_star: starboard_star || !data.starboard_star },
            })
            .then(async (i) => {
               await handleLog(auxdibot, guild, {
                  type: LogAction.STARBOARD_SETTINGS_CHANGED,
                  userID: user.id,
                  date: new Date(),
                  description: `The ability to star messages through a starboard for this server has been changed. (Now: ${
                     i.starboard_star ? 'Enabled' : 'Disabled'
                  } from ${data.starboard_star ? 'Enabled' : 'Disabled'})`,
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
