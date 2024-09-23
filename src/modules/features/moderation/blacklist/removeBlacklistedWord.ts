import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function removeBlacklistedWord(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string; username: string },
   index: number,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   const item = server.automod_banned_phrases.splice(index, 1);
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { automod_banned_phrases: server.automod_banned_phrases },
         select: { serverID: true, automod_banned_phrases: true },
      })
      .then(async (data) => {
         await auxdibot.log(guild, {
            userID: user.id,
            description: `Removed "${item[0]}" from the blacklisted phrases.`,
            type: LogAction.AUTOMOD_SETTINGS_CHANGE,
            date: new Date(),
         });
         return data;
      })
      .catch(() => {
         throw new Error('An error occurred trying to delete that blacklisted word!');
      });
}
