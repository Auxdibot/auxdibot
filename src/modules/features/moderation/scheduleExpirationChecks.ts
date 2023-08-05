import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { LogAction, PunishmentType } from '@prisma/client';
import { punishmentInfoField } from './punishmentInfoField';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';
export default function scheduleExpirationChecks(auxdibot: Auxdibot) {
   const task = new AsyncTask(
      'punishment expiration',
      async () => {
         for (const guild of auxdibot.guilds.cache.values()) {
            const server = await findOrCreateServer(auxdibot, guild.id);
            if (server) {
               const expired = server.punishments.filter((punishment) => {
                  if (
                     !punishment.expired &&
                     punishment.expires_date_unix &&
                     punishment.expires_date_unix <= Date.now()
                  ) {
                     punishment.expired = true;
                     return punishment;
                  }
               });
               if (expired) {
                  for (const expiredPunishment of expired) {
                     handleLog(
                        auxdibot,
                        guild,
                        {
                           type: LogAction.PUNISHMENT_EXPIRED,
                           description: `Punishment ID ${expiredPunishment.punishmentID} has expired.`,
                           date_unix: Date.now(),
                           userID: auxdibot.user.id,
                        },
                        [punishmentInfoField(expiredPunishment)],
                     );
                     switch (expiredPunishment.type) {
                        case PunishmentType.BAN:
                           guild.bans.remove(expiredPunishment.userID, 'Punishment expired.');
                           break;
                        case PunishmentType.MUTE:
                           const member = guild.members.resolve(expiredPunishment.userID);
                           if (!member || !server.mute_role) break;
                           member.roles.remove(server.mute_role);
                           break;
                     }
                  }
                  await auxdibot.database.servers
                     .update({
                        where: { serverID: server.serverID },
                        data: { punishments: server.punishments },
                     })
                     .catch(() => undefined);
               }
            }
         }
         return true;
      },
      (err) => {
         console.log('Error occurred in punishment expiration task!');
         console.log(err);
      },
   );
   auxdibot.scheduler.addIntervalJob(new SimpleIntervalJob({ minutes: 1 }, task));
}
