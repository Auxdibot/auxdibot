import { defaultServer } from './../../constants/database/defaultServer';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { Guild } from 'discord.js';

export function resetServer(auxdibot: Auxdibot, guild: Guild) {
   return auxdibot.database.servers
      .delete({ where: { serverID: guild.id } })
      .then(async (i) => {
         await auxdibot.database.servercards.delete({ where: { serverID: guild.id } }).catch(() => undefined);
         await auxdibot.database.servermembers
            .delete({ where: { serverID_userID: { serverID: guild.id, userID: undefined } } })
            .catch(() => undefined);
         await auxdibot.database.totals.delete({ where: { serverID: guild.id } }).catch(() => undefined);
         return i
            ? auxdibot.database.servers.create({ data: { serverID: i.serverID, ...defaultServer } }).then((i) => {
                 return i ? i : undefined;
              })
            : undefined;
      })
      .catch(() => {
         throw new Error('Failed to reset server.');
      });
}
