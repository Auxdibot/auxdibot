import { Auxdibot } from '@/interfaces/Auxdibot';
import { Guild } from 'discord.js';

export default async function setMessageXP(auxdibot: Auxdibot, guild: Guild, messageXP: number) {
   return auxdibot.database.servers.update({
      where: { serverID: guild.id },
      select: { level_channel: true, serverID: true },
      data: { message_xp: messageXP },
   });
}
