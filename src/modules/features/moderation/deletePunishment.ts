import { Auxdibot } from '@/Auxdibot';
import { Guild } from 'discord.js';
import { punishmentInfoField } from './punishmentInfoField';
import { LogAction } from '@prisma/client';

export default async function deletePunishment(
   auxdibot: Auxdibot,
   guild: Guild,
   punishmentID: number,
   user?: { id: string; username: string },
) {
   const punishment = await auxdibot.database.punishments.delete({
      where: { serverID_punishmentID: { serverID: guild.id, punishmentID } },
   });

   if (!punishment) return undefined;
   await auxdibot.log(
      guild,
      {
         type: LogAction.PUNISHMENT_DELETED,
         date: new Date(),
         userID: user.id,
         description: `${user.username} deleted a punishment. (PID: ${punishment.punishmentID})`,
      },
      { fields: [punishmentInfoField(punishment, true, true)] },
   );
   return punishment;
}
