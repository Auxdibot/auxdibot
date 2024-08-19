import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function deleteRoleMultiplier(auxdibot: Auxdibot, guild: Guild, user: { id: string }, id: number) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (server.role_multipliers.length <= id) throw new Error('Invalid id provided.');

   const multiplier = server.role_multipliers.splice(id, 1);
   return await auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { role_multipliers: server.role_multipliers },
         select: { role_multipliers: true },
      })
      .then((data) => {
         handleLog(auxdibot, guild, {
            type: LogAction.MULTIPLIER_DELETED,
            userID: user.id,
            date: new Date(),
            description: `Deleted the role multiplier #${id} (for <@&${multiplier[0]?.id}>) from your server.`,
         });
         return data;
      });
}
