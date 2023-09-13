import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function deletePermissionOverride(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string; username: string },
   id: number,
) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { permission_overrides: true } })
      .then(async (data) => {
         if (!data) throw new Error("couldn't find that server");
         if (data.permission_overrides.length < id) throw new Error('invalid id provided');
         const permission = data.permission_overrides[id];
         data.permission_overrides.splice(id, 1);
         await handleLog(auxdibot, guild, {
            userID: user.id,
            description: `${user.username} deleted permission override #${id + 1}.`,
            type: LogAction.PERMISSION_DELETED,
            date_unix: Date.now(),
         });
         return await auxdibot.database.servers
            .update({
               where: { serverID: guild.id },
               data: { permission_overrides: data.permission_overrides },
            })
            .then(() => permission);
      });
}
