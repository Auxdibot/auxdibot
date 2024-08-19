import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';
import { deleteLock } from './deleteLock';
export default function scheduleChannelUnlocks(auxdibot: Auxdibot) {
   const task = new AsyncTask(
      'channel unlocks',
      async () => {
         for (const guild of auxdibot.guilds.cache.values()) {
            const server = await findOrCreateServer(auxdibot, guild.id);
            if (server) {
               const expired = server.locked_channels.filter((channel) => {
                  if (channel.expiration_date && channel.expiration_date.valueOf() <= Date.now()) {
                     deleteLock(auxdibot, server, channel.channelID);
                     return channel;
                  }
               });
               if (expired) {
                  for (const expiredLock of expired) {
                     const channel = await guild.channels.fetch(expiredLock.channelID);
                     if (channel.isThread()) {
                        await channel
                           .setLocked(false)
                           .then(async () => undefined)
                           .catch(async () => undefined);
                     } else {
                        await channel.permissionOverwrites
                           .edit(guild.roles.everyone, {
                              SendMessages: true,
                              SendMessagesInThreads: true,
                              ...(channel.isVoiceBased()
                                 ? {
                                      Connect: true,
                                   }
                                 : {}),
                           })
                           .catch(() => undefined);
                     }

                     handleLog(auxdibot, guild, {
                        type: LogAction.CHANNEL_UNLOCKED,
                        description: `The channel #${channel.name} has been unlocked because the lock duration has been reached.`,
                        date: new Date(),
                        userID: auxdibot.user.id,
                     });
                  }
               }
            }
         }
         return true;
      },
      (err) => {
         console.log('Error occurred in channel unlock task!');
         console.log(err);
      },
   );
   auxdibot.scheduler.addIntervalJob(new SimpleIntervalJob({ minutes: 1 }, task));
}
