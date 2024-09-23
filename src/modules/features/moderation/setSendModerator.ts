import { Auxdibot } from '@/Auxdibot';
import { Guild } from 'discord.js';

export default async function setSendModerator(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   send_moderator?: boolean,
) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { punishment_send_moderator: true } })
      .then(async (data) => {
         return auxdibot.database.servers.update({
            where: { serverID: guild.id },
            select: { serverID: true, punishment_send_moderator: true },
            data: { punishment_send_moderator: send_moderator || !data.punishment_send_moderator },
         });
      });
}
