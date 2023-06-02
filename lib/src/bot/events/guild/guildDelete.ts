import { Guild } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import deleteServer from '@/modules/server/deleteServer';

export default async function guildDelete(auxdibot: Auxdibot, guild: Guild) {
   if (!guild) return;
   if (auxdibot.updateDiscordStatus) await auxdibot.updateDiscordStatus();
   deleteServer(auxdibot, guild.id);
   return;
}
