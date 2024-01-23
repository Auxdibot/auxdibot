import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import { LogAction, PermissionOverride } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function createPermissionOverride(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string; username: string },
   override: PermissionOverride,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);

   if (!testLimit(server.permission_overrides, Limits.PERMISSION_OVERRIDES_DEFAULT_LIMIT)) {
      throw new Error('You have too many permissions!');
   }
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { permission_overrides: { push: override } },
         select: { permission_overrides: true },
      })
      .then(async (i) => {
         await handleLog(
            auxdibot,
            guild,
            {
               type: LogAction.PERMISSION_CREATED,
               date_unix: Date.now(),
               userID: user.id,
               description: `${user.username} created a permission override. (OID: ${i.permission_overrides.length})`,
            },
            [
               {
                  name: `Permission Override (OID: ${i.permission_overrides.length})`,
                  value: `${override.allowed ? '✅' : '❎'} \`${override.permission}\` - ${
                     override.roleID ? `<@&${override.roleID}>` : override.userID ? `<@${override.userID}>` : ''
                  }`,
                  inline: false,
               },
            ],
         );
         return i;
      });
}
