import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function addBlacklistedPhrase(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string; username: string },
   blacklisted_phrase: string,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (server.automod_banned_phrases.find((i) => i == blacklisted_phrase)) {
      throw new Error('You already have this blacklisted phrase added!');
   }
   if (!testLimit(server.automod_banned_phrases, Limits.AUTOMOD_BLACKLIST_LIMIT)) {
      throw new Error('You have too many blacklisted phrases!');
   }
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { automod_banned_phrases: { push: blacklisted_phrase } },
         select: { serverID: true, automod_banned_phrases: true },
      })
      .then((i) => {
         handleLog(auxdibot, guild, {
            userID: user.id,
            description: `Added "${blacklisted_phrase}" as a blacklisted phrase.`,
            type: LogAction.AUTOMOD_SETTINGS_CHANGE,
            date: new Date(),
         });
         return i;
      })
      .catch(() => {
         throw new Error(`Failed to add "${blacklisted_phrase}" to your blacklisted phrases!`);
      });
}
