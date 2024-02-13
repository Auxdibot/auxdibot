import { defaultServer } from '../../constants/database/defaultServer';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { Guild } from 'discord.js';
import deleteServer from './deleteServer';

export function resetServer(auxdibot: Auxdibot, guild: Guild) {
   return auxdibot.database.servers
      .findFirstOrThrow({ where: { serverID: guild.id } })
      .then(async (i) => {
         await deleteServer(auxdibot, guild.id).catch(() => undefined);
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
