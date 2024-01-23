import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function deletePermissionOverride(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string; username: string },
   id: number,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (server.permission_overrides.length <= id) throw new Error('Invalid id provided.');

   server.permission_overrides.splice(id, 1);
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { permission_overrides: server.permission_overrides },
         select: { permission_overrides: true },
      })
      .then(async (permissions) => {
         await handleLog(auxdibot, guild, {
            userID: user.id,
            description: `${user.username} deleted permission override #${id + 1}.`,
            type: LogAction.PERMISSION_DELETED,
            date_unix: Date.now(),
         });
         return permissions;
      })
      .catch(() => {
         throw new Error("Couldn't remove that permission override!");
      });
}
