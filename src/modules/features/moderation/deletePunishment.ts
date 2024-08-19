import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { Guild } from 'discord.js';
import { punishmentInfoField } from './punishmentInfoField';
import { LogAction } from '@prisma/client';

export default async function deletePunishment(
   auxdibot: Auxdibot,
   guild: Guild,
   punishmentID: number,
   user?: { id: string; username: string },
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   const punishment = server.punishments.find((punishment) => punishment.punishmentID == punishmentID);
   server.punishments.splice(server.punishments.indexOf(punishment), 1);

   if (!punishment) return undefined;
   return await auxdibot.database.servers
      .update({ where: { serverID: guild.id }, data: { punishments: server.punishments } })
      .then(async () => {
         await handleLog(
            auxdibot,
            guild,
            {
               type: LogAction.PUNISHMENT_DELETED,
               date: new Date(),
               userID: user.id,
               description: `${user.username} deleted a punishment. (PID: ${punishment.punishmentID})`,
            },
            [punishmentInfoField(punishment, true, true)],
         );
         return punishment;
      })
      .catch(() => undefined);
}
