import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import axios from 'axios';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';
import { FeedType } from '@prisma/client';
import Parser from 'rss-parser';
import publishNotification from './publishNotification';

export default class Subscriber {
   subscriptions: { topic: string; type: FeedType; guilds: string[] }[];
   twitch_access_token?: string;
   constructor() {
      this.subscriptions = [];
   }
   async twitchInit() {
      const data = await axios
         .post(
            `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
         )
         .then((data) => {
            this.twitch_access_token = data.data.access_token;
            return this.twitch_access_token;
         })
         .catch(() => undefined);
      return data;
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
   async testFeed(topic: string) {
      return await axios
         .get(topic)
         .then((data) => {
            const feed = new Parser();
            return feed.parseString(data.data).then(() => {
               return true;
            });
         })
         .catch(() => false);
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
      if (['YOUTUBE', 'RSS'].includes(subscription.type)) {
         auxdibot.scheduler.removeById(`subscriptions ${topic}`);
         this.subscriptions.splice(this.subscriptions.indexOf(subscription), 1);
      } else if (['TWITCH'].includes(subscription.type)) {
         const headers = {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            Authorization: `Bearer ${this.twitch_access_token}`,
            'Content-Type': 'application/json',
         };
         await axios
            .delete(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscription.topic}`, {
               headers: headers,
            })
            .catch(() => {
               return undefined;
            });
      }
   }
   async subscribe(topic: string, type: FeedType, auxdibot: Auxdibot, guildId: string) {
      const subscription = this.subscriptions.find((i) => i.topic == topic);
      if (this.subscriptions.find((i) => i.topic == topic)) {
         if (!subscription.guilds.includes(guildId)) subscription.guilds.push(guildId);
         return true;
      }

      if (type == 'YOUTUBE' || type == 'RSS') {
         const initial = await this.testFeed(topic).catch(() => undefined);
         if (!initial) return undefined;
         const task = new AsyncTask(
            `subscriptions ${topic}`,
            async () => {
               const data = await this.fetchFeed(topic).catch(() => {
                  return undefined;
               });

               if (!data) return;

               for (const guild of auxdibot.guilds.cache.values()) {
                  const server = await findOrCreateServer(auxdibot, guild.id);
                  for (const i of server.notifications) {
                     if (i.topicURL == topic) {
                        if (
                           data &&
                           JSON.stringify(data) != i.previous_data &&
                           (data?.date ?? Date.now()) > (JSON.parse(i.previous_data)?.date ?? 0)
                        ) {
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
                                 publishNotification(auxdibot, guild, i, data).catch(() => undefined);
                              })
                              .catch(() => {
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
         return topic;
      } else if (type == 'TWITCH') {
         const headers = {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            Authorization: `Bearer ${this.twitch_access_token}`,
            'Content-Type': 'application/json',
         };
         const user = await axios
            .get(`https://api.twitch.tv/helix/users?login=${topic}`, { headers: headers })
            .then((data) => data.data?.data[0])
            .catch(() => undefined);
         if (!user || !user['id']) return;

         const data = {
            type: 'stream.online',
            version: '1',
            condition: {
               broadcaster_user_id: user['id'],
            },
            transport: {
               method: 'webhook',
               callback: `${process.env.SITE_URL}/api/v1/notifications/callbacks/twitch`,
               secret: process.env.HMAC_SECRET,
            },
         };

         const response = await axios
            .post('https://api.twitch.tv/helix/eventsub/subscriptions', data, {
               headers: headers,
            })
            .then((data) => data.data)
            .catch(async (error) => {
               if (error?.response?.status == 409) {
                  return await axios
                     .get(`https://api.twitch.tv/helix/eventsub/subscriptions?broadcaster_id=${user['id']}`, {
                        headers: headers,
                     })
                     .then((data) => data.data)
                     .catch(() => undefined);
               }
               return undefined;
            });
         if (!response?.data?.length) return;
         this.subscriptions.push({ topic: response?.data[0]?.id, type, guilds: [guildId] });
         return response?.data[0]?.id;
      }
   }
}
