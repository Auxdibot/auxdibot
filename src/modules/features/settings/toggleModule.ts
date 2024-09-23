import { Auxdibot } from '@/Auxdibot';
import { Guild } from 'discord.js';

export default async function toggleModule(auxdibot: Auxdibot, guild: Guild, module: string, enabled?: boolean) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { disabled_modules: true } })
      .then(async (data) => {
         if ((!enabled || enabled == undefined) && data.disabled_modules.indexOf(module) == -1)
            data.disabled_modules.push(module);
         else if ((enabled || enabled == undefined) && data.disabled_modules.indexOf(module) != -1)
            data.disabled_modules.splice(data.disabled_modules.indexOf(module), 1);
         return auxdibot.database.servers.update({
            where: { serverID: guild.id },
            data: { disabled_modules: data.disabled_modules },
         });
      });
}
