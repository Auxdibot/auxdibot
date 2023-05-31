import { Guild } from 'discord.js';
import Server from '@/mongo/model/server/Server';
import { Auxdibot } from '@/interfaces/Auxdibot';

module.exports = {
   name: 'guildDelete',
   once: false,
   async execute(guild: Guild) {
      if (!guild) return;
      await Server.deleteByDiscordId(guild.id.toString());
      const client = guild.client as Auxdibot;
      if (client.updateDiscordStatus) await client.updateDiscordStatus();
      return;
   },
};
