import { Auxdibot } from '@/Auxdibot';
import addTimestampToDate from '@/util/addTimestampToDate';

import parsePlaceholders from '@/util/parsePlaceholder';
import timestampToDuration from '@/util/timestampToDuration';
import { APIEmbed } from 'discord.js';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';

export default function scheduleRunReminders(auxdibot: Auxdibot) {
   const task = new AsyncTask(
      'send reminders',
      async () => {
         const now = new Date();
         now.setSeconds(0);
         const reminderUsers = await auxdibot.database.users
            .findMany({ where: { reminders: { isEmpty: false } } })
            .catch(() => []);
         for (const user of reminderUsers) {
            for (const reminder of user.reminders) {
               let addedDate = addTimestampToDate(reminder.last_run, reminder.interval_timestamp);
               if (addedDate.valueOf() <= now.valueOf()) {
                  while (
                     (Number(timestampToDuration(reminder.interval_timestamp)) || 0) > 0 &&
                     addTimestampToDate(addedDate, reminder.interval_timestamp).valueOf() < now.valueOf()
                  ) {
                     addedDate = addTimestampToDate(addedDate, reminder.interval_timestamp);
                  }
                  reminder.last_run = addedDate;
                  reminder.times_run++;
                  if (reminder.times_to_run && reminder.times_run >= reminder.times_to_run) {
                     user.reminders.splice(user.reminders.indexOf(reminder), 1);
                  }
                  await auxdibot.database.users
                     .update({
                        where: { userID: user.userID },
                        data: { reminders: user.reminders },
                     })
                     .catch(() => undefined);
                  const userDiscord = await auxdibot.users.fetch(user.userID).catch(() => undefined);
                  if (userDiscord) {
                     await userDiscord
                        .send({
                           content: `-# This is a reminder from Auxdibot that you have scheduled.\n\n${
                              reminder.message
                                 ? await parsePlaceholders(auxdibot, reminder.message, {
                                      member: userDiscord,
                                   })
                                 : ''
                           }`,
                           ...(Object.entries(reminder.embed || {}).length != 0
                              ? {
                                   embeds: [
                                      JSON.parse(
                                         await parsePlaceholders(auxdibot, JSON.stringify(reminder.embed), {
                                            member: userDiscord,
                                         }),
                                      ) as APIEmbed,
                                   ],
                                }
                              : {}),
                        })
                        .catch((x) => console.log(x));
                  }
               }
            }
         }
         return true;
      },
      (err) => {
         console.log('Error occurred in sending run reminders task!');
         console.log(err);
      },
   );
   auxdibot.scheduler.addIntervalJob(new SimpleIntervalJob({ minutes: 1 }, task));
}
