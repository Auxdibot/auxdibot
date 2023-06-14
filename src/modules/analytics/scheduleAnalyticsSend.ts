import { Auxdibot } from '@/interfaces/Auxdibot';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';
import sendAnalytics from './sendAnalytics';
export default function scheduleAnalyticsSend(auxdibot: Auxdibot) {
   const task = new AsyncTask(
      'send analytics',
      async () => {
         await sendAnalytics(auxdibot);
      },
      (err) => {
         console.log('Error occurred in sending analytics task!');
         console.log(err);
      },
   );
   auxdibot.scheduler.addIntervalJob(new SimpleIntervalJob({ minutes: 15 }, task));
}
