import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import axios from 'axios';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';
import { FeedType } from '@prisma/client';
import Parser from 'rss-parser';
import { toAPIEmbed } from '@/util/toAPIEmbed';
import parsePlaceholders from '@/util/parsePlaceholder';

export default class Subscriber {
   subscriptions: { topic: string; type: FeedType; guilds: string[] }[];
   constructor() {
      this.subscriptions = [];
   }
   async fetchFeed(topic: string) {
      return await axios.get(topic).then((data) => {
         const feed = new Parser();
         return feed.parseString(data.data).then((data) => {
            return data.items[0]
               ? {
                    title: data.items[0].title,
                    link: data.items[0].link,
                    content: data.items[0].content,
                    date: new Date(data.items[0].pubDate)?.valueOf() ?? Date.now(),
                    author: data.items[0].author,
                 }
               : undefined;
         });
      });
   }
   async removeGuild(topic: string, guildId: string, auxdibot: Auxdibot) {
      const subscription = this.subscriptions.find((i) => i.topic == topic);
      if (!subscription) return;
      const index = subscription.guilds.indexOf(guildId);
      if (index == -1) return;
      subscription.guilds.splice(index, 1);
      if (subscription.guilds.length == 0) {
         this.unsubscribe(topic, auxdibot);
      }
   }
   async unsubscribe(topic: string, auxdibot: Auxdibot) {
      const subscription = this.subscriptions.find((i) => i.topic == topic);
      if (!subscription) return;
      auxdibot.scheduler.removeById(`subscriptions ${topic}`);
   }
   async subscribe(topic: string, type: FeedType, auxdibot: Auxdibot, guildId: string) {
      const subscription = this.subscriptions.find((i) => i.topic == topic);
      if (this.subscriptions.find((i) => i.topic == topic)) {
         if (!subscription.guilds.includes(guildId)) subscription.guilds.push(guildId);
         return;
      }
      const initial = await this.fetchFeed(topic).catch(() => undefined);
      if (!initial) return;
      const task = new AsyncTask(
         `subscriptions ${topic}`,
         async () => {
            const data = await this.fetchFeed(topic).catch((x) => {
               console.log(x);
               return undefined;
            });

            if (!data) return;

            for (const guild of auxdibot.guilds.cache.values()) {
               const server = await findOrCreateServer(auxdibot, guild.id);
               for (const i of server.notifications) {
                  if (i.topicURL == topic) {
                     if (data && JSON.stringify(data) != i.previous_data) {
                        console.log(data);
                        server.notifications[server.notifications.indexOf(i)] = {
                           ...i,
                           previous_data: JSON.stringify(data),
                        };
                        auxdibot.database.servers
                           .update({
                              where: { serverID: guild.id },
                              data: { notifications: server.notifications },
                           })
                           .then(async () => {
                              const channel = guild.channels.cache.get(i.channelID);
                              if (channel && channel.isTextBased() && i.type == 'YOUTUBE') {
                                 channel.send({
                                    content: await parsePlaceholders(
                                       auxdibot,
                                       i.message.content,
                                       guild,
                                       undefined,
                                       undefined,
                                       undefined,
                                       data,
                                    ),
                                    embeds: i.message.embed
                                       ? [
                                            toAPIEmbed(
                                               JSON.parse(
                                                  await parsePlaceholders(
                                                     auxdibot,
                                                     JSON.stringify(i.message.embed),
                                                     guild,
                                                     undefined,
                                                     undefined,
                                                     undefined,
                                                     data,
                                                  ),
                                               ),
                                            ),
                                         ]
                                       : undefined,
                                 });
                              }
                           })
                           .catch((x) => {
                              console.log(x);
                              return undefined;
                           });
                     }
                  }
               }
            }
            return true;
         },
         (err) => {
            console.log('Error occurred in subscription task!');
            console.log(err);
         },
      );
      auxdibot.scheduler.addIntervalJob(new SimpleIntervalJob({ minutes: 2 }, task));
      this.subscriptions.push({ topic, type, guilds: [guildId] });
      return initial;
   }
}
