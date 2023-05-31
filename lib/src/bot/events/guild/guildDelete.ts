import { Guild } from 'discord.js';
import Server from '@/mongo/model/server/Server';
import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function guildDelete(guild: Guild) {
   if (!guild) return;
   await Server.deleteByDiscordId(guild.id.toString());
   const client = guild.client as Auxdibot;
   if (client.updateDiscordStatus) await client.updateDiscordStatus();
   return;
}
