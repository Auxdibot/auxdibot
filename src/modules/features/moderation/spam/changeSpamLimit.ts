import { Auxdibot } from '@/Auxdibot';

import { AutomodLimit, LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function changeSpamLimit(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string; username: string },
   spam: AutomodLimit | null,
) {
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { automod_spam_limit: spam },
         select: { automod_spam_limit: true },
      })
      .then(async (i) => {
         await auxdibot.log(guild, {
            userID: user.id,
            description:
               spam.messages == 0 || spam.duration == 0
                  ? 'Disabled spam filter.'
                  : `The Automod spam limit has been set to ${spam.messages} messages every ${spam.duration} seconds.`,
            type: LogAction.AUTOMOD_SETTINGS_CHANGE,
            date: new Date(),
         });
         return i;
      });
}
