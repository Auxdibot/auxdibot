import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function createSubscribers(auxdibot: Auxdibot) {
   const guilds = await auxdibot.database.servers.findMany();
   for (const guild of guilds) {
      for (const i of guild.notifications) {
         const initial = await auxdibot.subscriber.subscribe(i.topicURL, i.type, auxdibot, guild.id);
         if (initial && !i.previous_data) {
            if (i.type == 'YOUTUBE' || i.type == 'RSS') {
               guild.notifications[guild.notifications.indexOf(i)] = {
                  ...i,
                  previous_data: JSON.stringify(initial),
               };
               auxdibot.database.servers
                  .update({
                     where: { serverID: guild.id },
                     data: { notifications: guild.notifications },
                  })
                  .catch(() => undefined);
            }
         }
      }
   }
}
