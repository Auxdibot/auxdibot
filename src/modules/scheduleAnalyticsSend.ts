import { Auxdibot } from '@/interfaces/Auxdibot';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';
export default function scheduleAnalyticsSend(auxdibot: Auxdibot) {
   const task = new AsyncTask(
      'send analytics',
      async () => {
         await auxdibot.guilds.fetch();
         const analytics = {
            servers: auxdibot.guilds.cache.size,
            members: auxdibot.guilds.cache.reduce((acc, i) => acc + i.memberCount, 0),
            commands: auxdibot.commands.reduce((acc, i) => acc + 1 + (i.subcommands?.length || 0), 0),
         };
         return auxdibot.database.analytics
            .upsert({
               where: { clientID: auxdibot.user.id },
               update: analytics,
               create: { clientID: auxdibot.user.id, ...analytics },
            })
            .then(() => true)
            .catch(() => false);
      },
      (err) => {
         console.log('Error occurred in sending analytics task!');
         console.log(err);
      },
   );
   auxdibot.scheduler.addIntervalJob(new SimpleIntervalJob({ minutes: 1 }, task));
}
