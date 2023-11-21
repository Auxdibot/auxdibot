import { Auxdibot } from '@/interfaces/Auxdibot';
import { Guild } from 'discord.js';

export default async function setSendReason(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   send_reason?: boolean,
) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { punishment_send_reason: true } })
      .then(async (data) => {
         return auxdibot.database.servers.update({
            where: { serverID: guild.id },
            select: { serverID: true, punishment_send_reason: true },
            data: { punishment_send_reason: send_reason || !data.punishment_send_reason },
         });
      });
}
