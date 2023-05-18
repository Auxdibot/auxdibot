import { Guild } from 'discord.js';
import Server from '@models/server/Server';
import { IAuxdibot } from '@util/templates/IAuxdibot';

module.exports = {
   name: 'guildDelete',
   once: false,
   async execute(guild: Guild) {
      if (!guild) return;
      await Server.deleteByDiscordId(guild.id.toString());
      const client: IAuxdibot = guild.client;
      if (client.updateDiscordStatus) await client.updateDiscordStatus();
      return;
   },
};
