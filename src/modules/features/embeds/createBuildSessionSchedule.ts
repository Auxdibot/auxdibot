import { Auxdibot } from '@/interfaces/Auxdibot';
import { ChannelType } from 'discord.js';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';
export default function createBuildSessionSchedule(auxdibot: Auxdibot) {
   const task = new AsyncTask(
      'build session expiration',
      async () => {
         for (const session of auxdibot.build_sessions.keys()) {
            const [guildID, channelID, messageID] = session.split(':');
            const guild = auxdibot.guilds.cache.get(guildID);
            if (!guild) {
               auxdibot.build_sessions.delete(session);
               continue;
            }
            const channel = guild.channels.cache.get(channelID);
            if (!channel || channel.type != ChannelType.GuildText) {
               auxdibot.build_sessions.delete(session);
               continue;
            }
            const message = await channel.messages.fetch(messageID).catch(() => undefined);
            if (!message) {
               auxdibot.build_sessions.delete(session);
               continue;
            }
            const sessionData = auxdibot.build_sessions.get(session);
            if (!sessionData) {
               auxdibot.build_sessions.delete(session);
               continue;
            }
            if (sessionData.last_interaction.valueOf() - Date.now() > 300000) {
               auxdibot.build_sessions.delete(session);
               continue;
            }
         }
      },
      (err) => {
         console.log('Error occurred in punishment expiration task!');
         console.log(err);
      },
   );
   auxdibot.scheduler.addIntervalJob(new SimpleIntervalJob({ minutes: 1 }, task));
}
