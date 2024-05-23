import { Auxdibot } from '@/interfaces/Auxdibot';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';
export default function scheduleStarboardTimeoutClear(auxdibot: Auxdibot) {
   const task = new AsyncTask(
      'starboard timeout clear',
      async () => {
         auxdibot.starboard_timeout = auxdibot.starboard_timeout.filter(
            (_i, usr) => auxdibot.starboard_timeout.get(usr) > Date.now() - 5000,
         );
         return true;
      },
      (err) => {
         console.log('Error occurred in starboard timeout clear task!');
         console.log(err);
      },
   );
   auxdibot.scheduler.addIntervalJob(new SimpleIntervalJob({ seconds: 5 }, task));
}
