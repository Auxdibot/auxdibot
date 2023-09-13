import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
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
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { permission_overrides: true } })
      .then((data) => {
         if (!testLimit(data.permission_overrides, Limits.PERMISSION_OVERRIDES_DEFAULT_LIMIT)) {
            throw new Error('permissions limit exceeded');
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
                     description: `${user.username} created a permission override. (OID: ${
                        data.permission_overrides.length + 1
                     })`,
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
      });
}
