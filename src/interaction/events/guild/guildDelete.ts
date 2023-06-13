import { Guild } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import deleteServer from '@/modules/server/deleteServer';

export default async function guildDelete(auxdibot: Auxdibot, guild: Guild) {
   if (auxdibot.updateDiscordStatus) await auxdibot.updateDiscordStatus();
   await deleteServer(auxdibot, guild.id);
   return;
}
