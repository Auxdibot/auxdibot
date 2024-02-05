import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function deleteNotification(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string; username: string },
   id: number,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (server.notifications.length <= id) throw new Error('Invalid id provided.');

   const notif = server.notifications.splice(id, 1);
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { notifications: server.notifications },
         select: { notifications: true },
      })
      .then(async () => {
         await handleLog(auxdibot, guild, {
            userID: user.id,
            description: `${user.username} deleted notification #${id + 1}.`,
            type: LogAction.PERMISSION_DELETED,
            date_unix: Date.now(),
         });
         auxdibot.subscriber.removeGuild(notif[0].topicURL, guild.id, auxdibot);
         return notif;
      })
      .catch(() => {
         throw new Error("Couldn't remove that notification!");
      });
}
