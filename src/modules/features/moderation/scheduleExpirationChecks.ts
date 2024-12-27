import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

import { LogAction, PunishmentType } from '@prisma/client';
import { punishmentInfoField } from './punishmentInfoField';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';
import { getServerPunishments } from './getServerPunishments';
export default function scheduleExpirationChecks(auxdibot: Auxdibot) {
   const task = new AsyncTask(
      'punishment expiration',
      async () => {
         for (const guild of auxdibot.guilds.cache.values()) {
            const server = await findOrCreateServer(auxdibot, guild.id);
            if (server) {
               const expiringPunishments = await getServerPunishments(auxdibot, guild.id, {
                  expired: false,
                  expires_date: { lte: new Date() },
               });

               if (expiringPunishments.length > 0) {
                  await auxdibot.database.punishments.updateMany({
                     where: { serverID: guild.id, expired: false, expires_date: { lte: new Date() } },
                     data: { expired: true },
                  });
                  for (const expiredPunishment of expiringPunishments) {
                     auxdibot.log(
                        guild,
                        {
                           type: LogAction.PUNISHMENT_EXPIRED,
                           description: `Punishment ID ${expiredPunishment.punishmentID} has expired.`,
                           date: new Date(),
                           userID: auxdibot.user.id,
                        },
                        { fields: [punishmentInfoField(expiredPunishment, true, true)] },
                     );
                     switch (expiredPunishment.type) {
                        case PunishmentType.BAN:
                           guild.bans.remove(expiredPunishment.userID, 'Punishment expired.').catch(() => undefined);
                           break;
                        case PunishmentType.MUTE:
                           const member = guild.members.resolve(expiredPunishment.userID);
                           if (!member) break;
                           if (server.mute_role) {
                              member.roles.remove(server.mute_role).catch(() => undefined);
                           } else {
                              member.timeout(null, 'Unmuted').catch(() => undefined);
                           }
                           break;
                     }
                  }
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
