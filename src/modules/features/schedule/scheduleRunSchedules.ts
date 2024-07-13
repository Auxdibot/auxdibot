import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import addTimestampToDate from '@/util/addTimestampToDate';
import durationToTimestamp from '@/util/durationToTimestamp';
import parsePlaceholders from '@/util/parsePlaceholder';
import { APIEmbed } from 'discord.js';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';

export default function scheduleRunSchedules(auxdibot: Auxdibot) {
   const task = new AsyncTask(
      'send schedules',
      async () => {
         const now = new Date();
         now.setSeconds(0);
         for (const guild of auxdibot.guilds.cache.values()) {
            const server = await findOrCreateServer(auxdibot, guild.id);
            if (server) {
               for (const schedule of server.scheduled_messages) {
                  let scheduleChanged = false;
                  if (schedule.old_last_run_unix && !schedule.last_run) {
                     schedule.last_run = new Date(schedule.old_last_run_unix);
                     scheduleChanged = true;
                  }
                  if (schedule.old_interval_unix && !schedule.interval_timestamp) {
                     schedule.interval_timestamp = durationToTimestamp(schedule.old_interval_unix);
                     scheduleChanged = true;
                     if (!schedule.interval_timestamp) {
                        scheduleChanged = false;
                        server.scheduled_messages.splice(server.scheduled_messages.indexOf(schedule), 1);
                        await auxdibot.database.servers.update({
                           where: { serverID: server.serverID },
                           data: { scheduled_messages: server.scheduled_messages },
                        });
                     }
                  }
                  let addedDate = addTimestampToDate(schedule.last_run, schedule.interval_timestamp);
                  if (addedDate.valueOf() <= now.valueOf()) {
                     while (addTimestampToDate(addedDate, schedule.interval_timestamp).valueOf() < now.valueOf()) {
                        addedDate = addTimestampToDate(addedDate, schedule.interval_timestamp);
                     }
                     schedule.last_run = addedDate;
                     schedule.times_run++;
                     if (schedule.times_to_run && schedule.times_run >= schedule.times_to_run) {
                        server.scheduled_messages.splice(server.scheduled_messages.indexOf(schedule), 1);
                     }
                     await auxdibot.database.servers.update({
                        where: { serverID: server.serverID },
                        data: { scheduled_messages: server.scheduled_messages },
                     });
                     const channel = schedule.channelID ? guild.channels.cache.get(schedule.channelID) : undefined;
                     if (channel.isTextBased()) {
                        await channel
                           .send({
                              content: `${schedule.message || ''}`,
                              ...(Object.entries(schedule.embed || {}).length != 0
                                 ? {
                                      embeds: [
                                         JSON.parse(
                                            await parsePlaceholders(auxdibot, JSON.stringify(schedule.embed), {
                                               guild,
                                            }),
                                         ) as APIEmbed,
                                      ],
                                   }
                                 : {}),
                           })
                           .catch((x) => console.log(x));
                     }
                  } else if (scheduleChanged) {
                     await auxdibot.database.servers.update({
                        where: { serverID: server.serverID },
                        data: { scheduled_messages: server.scheduled_messages },
                     });
                  }
               }
            }
         }
         return true;
      },
      (err) => {
         console.log('Error occurred in sending run schedules task!');
         console.log(err);
      },
   );
   auxdibot.scheduler.addIntervalJob(new SimpleIntervalJob({ minutes: 1 }, task));
}
