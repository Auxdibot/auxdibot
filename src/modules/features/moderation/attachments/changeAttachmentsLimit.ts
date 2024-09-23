import { Auxdibot } from '@/Auxdibot';
import handleLog from '@/util/handleLog';
import { AutomodLimit, LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function changeAttachmentsLimit(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string; username: string },
   attachments: AutomodLimit | null,
) {
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { automod_attachments_limit: attachments },
         select: { automod_attachments_limit: true },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            userID: user.id,
            description:
               attachments.messages == 0 || attachments.duration == 0
                  ? 'Disabled attachments filter.'
                  : `The Automod attachments limit has been set to ${attachments.messages} attachments every ${attachments.duration} seconds.`,
            type: LogAction.AUTOMOD_SETTINGS_CHANGE,
            date: new Date(),
         });
         return i;
      });
}
