import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function deleteStarboard(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   board_name: string,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   const index = server.starboard_boards.findIndex((i) => i.board_name == board_name);
   if (index == -1) throw new Error('Invalid board name provided.');

   server.starboard_boards.splice(index, 1);
   return await auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { starboard_boards: server.starboard_boards },
         select: { starboard_boards: true },
      })
      .then((data) => {
         auxdibot.log(guild, {
            type: LogAction.STARBOARD_DELETED,
            userID: user.id,
            date: new Date(),
            description: `Deleted the starboard \`${board_name}\` from your server.`,
         });
         return data;
      })
      .catch((x) => {
         console.error(x);
         throw new Error(
            'Woah! An unknown error occurred. Please contact the Auxdibot Support server to see if we can resolve this!',
         );
      });
}
