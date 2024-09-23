import { Auxdibot } from '@/Auxdibot';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';
import findOrCreateServer from '../server/findOrCreateServer';
export default function scheduleClearMessageCache(auxdibot: Auxdibot) {
   const task = new AsyncTask(
      'clear message cache',
      async () => {
         auxdibot.messages = auxdibot.messages.filter((_i, sent) => sent > BigInt(Date.now() - 120000));
         auxdibot.spam_detections = await auxdibot.spam_detections.filter(async (i, date) => {
            const server = await findOrCreateServer(auxdibot, date[0]);
            return date[1] > BigInt(Date.now() - server.automod_spam_limit?.duration || Date.now());
         });
         return true;
      },
      (err) => {
         console.log('Error occurred in clear message cache task!');
         console.log(err);
      },
   );
   auxdibot.scheduler.addIntervalJob(new SimpleIntervalJob({ minutes: 2 }, task));
}
