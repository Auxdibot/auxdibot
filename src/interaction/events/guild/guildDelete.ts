import { Guild } from 'discord.js';
import { Auxdibot } from '@/Auxdibot';
import deleteServer from '@/modules/server/deleteServer';

export default async function guildDelete(auxdibot: Auxdibot, guild: Guild) {
   await deleteServer(auxdibot, guild.id).catch(() => undefined);
   return;
}
