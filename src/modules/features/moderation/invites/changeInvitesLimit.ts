import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { AutomodLimit, LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function changeInvitesLimit(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string; username: string },
   invites: AutomodLimit | null,
) {
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { automod_invites_limit: invites },
         select: { automod_invites_limit: true },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            userID: user.id,
            description:
               invites.messages == 0 || invites.duration == 0
                  ? 'Disabled invites filter.'
                  : `The Automod invites limit has been set to ${invites.messages} invites every ${invites.duration} seconds.`,
            type: LogAction.AUTOMOD_SETTINGS_CHANGE,
            date: new Date(),
         });
         return i;
      });
}
