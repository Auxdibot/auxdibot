import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import parsePlaceholders from '@/util/parsePlaceholder';
import { APIEmbed } from 'discord.js';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';

export default function scheduleRunSchedules(auxdibot: Auxdibot) {
   const task = new AsyncTask(
      'send schedules',
      async () => {
         for (const guild of auxdibot.guilds.cache.values()) {
            const server = await findOrCreateServer(auxdibot, guild.id);
            if (server) {
               for (const schedule of server.scheduled_messages) {
                  const now = new Date(Date.now());
                  now.setSeconds(0);
                  if ((schedule.last_run_unix || now.valueOf()) + schedule.interval_unix <= now.valueOf()) {
                     const channel = schedule.channelID ? guild.channels.cache.get(schedule.channelID) : undefined;
                     if (channel.isTextBased()) {
                        await channel
                           .send({
                              content: `${schedule.message || ''}`,
                              ...(Object.entries(schedule.embed || {}).length != 0
                                 ? {
                                      embeds: [
                                         JSON.parse(
                                            await parsePlaceholders(auxdibot, JSON.stringify(schedule.embed), guild),
                                         ) as APIEmbed,
                                      ],
                                   }
                                 : {}),
                           })
                           .catch((x) => console.log(x));
                     }
                     schedule.last_run_unix = now.valueOf();
                     schedule.times_run++;
                     if (schedule.times_to_run && schedule.times_run >= schedule.times_to_run)
                        server.scheduled_messages.splice(server.scheduled_messages.indexOf(schedule), 1);
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
