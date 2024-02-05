import { ToadScheduler } from 'toad-scheduler';
import 'module-alias/register';
import { ActivityType, Client, Collection, EmbedBuilder, REST } from 'discord.js';

import 'dotenv/config';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { AuxdibotIntents } from '@/constants/bot/AuxdibotIntents';
import listenEvents from '@/interaction/events/listenEvents';
import connectPrisma from './modules/database/connectPrisma';
import { AuxdibotPartials } from './constants/bot/AuxdibotPartials';
import refreshInteractions from './interaction/refreshInteractions';
import scheduleExpirationChecks from './modules/features/moderation/scheduleExpirationChecks';
import scheduleRunSchedules from './modules/features/schedule/scheduleRunSchedules';
import server from './server/server';
import fetchAnalytics from './modules/analytics/fetchAnalytics';
import scheduleChannelUnlocks from './modules/features/moderation/lock/scheduleChannelUnlocks';
import scheduleClearMessageCache from './modules/features/scheduleClearMessageCache';
import { CustomEmojis } from './constants/bot/CustomEmojis';
import Subscriber from './modules/features/notifications/Subscriber';
import createSubscribers from './modules/features/notifications/createSubscribers';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_BOT_CLIENT_ID;
(async () => {
   /********************************************************************************/
   // Enviornment variables checks.
   if (!TOKEN) throw new Error('You need to include a discord token in .env!');
   if (!CLIENT_ID) throw new Error('You need to include a client id in .env!');

   /********************************************************************************/
   // Create Client

   console.log(`-> Creating a new client...`);

   const auxdibot = new Client({
      intents: AuxdibotIntents,
      partials: AuxdibotPartials,
      presence: {
         activities: [
            {
               type: ActivityType.Custom,
               name: 'Auxdibot',
               url: 'https://bot.auxdible.me',
               state: `⌚ Loading...`,
            },
         ],
      },
   }) as Auxdibot;

   /********************************************************************************/
   // Declare client variables
   connectPrisma(auxdibot);
   console.log('-> Declaring client variables...');
   auxdibot.commands = new Collection();
   auxdibot.buttons = new Collection();
   auxdibot.select_menus = new Collection();
   auxdibot.modals = new Collection();
   auxdibot.messages = new Collection();
   auxdibot.spam_detections = new Collection();
   auxdibot.invites_detections = new Collection();
   auxdibot.attachments_detections = new Collection();
   auxdibot.scheduler = new ToadScheduler();
   auxdibot.subscriber = new Subscriber();
   auxdibot.colors = {
      accept: 0x8bc34a,
      denied: 0xf44336,
      info: 0x00bcd4,
      default: 0xfe8a00,
      punishment: 0x9c0e11,
      log: 0xf9f3d2,
      reaction_role: 0xf3c810,
      levels: 0xf1c71b,
      suggestions: {
         WAITING: 0x5c5c5c,
         DENIED: 0xcc3131,
         APPROVED: 0x54cc31,
         CONSIDERED: 0xf2e876,
         ADDED: 0x31ccc4,
      },
   };
   auxdibot.embeds = {
      welcome: new EmbedBuilder()
         .setColor(auxdibot.colors.default)
         .setTitle(`${CustomEmojis.GREETINGS} Hello, I'm Auxdibot!`)
         .setThumbnail(`${process.env.BOT_HOMEPAGE}/logo.png`)
         .setDescription(
            `Auxdibot is a Discord bot project founded and maintained by Auxdible. Auxdibot features a wide variety of features for admins to manage their servers with. Auxdibot receives consistant updates and constant bug fixes, making it a reliable choice for your server! Visit Auxdibot's website & dashboard [here](${process.env.BOT_HOMEPAGE})!`,
         )
         .setFields(
            {
               name: 'Where do I start?',
               value: `Auxdibot features two amazing ways for administrators to start learning how to use Auxdibot!\n\n\ ${CustomEmojis.HELP} - The \`/help all\` slash command.\n ${CustomEmojis.DOCS} - The [official Auxdibot documentation](${process.env.BOT_HOMEPAGE}/docs)`,
               inline: true,
            },
            {
               name: 'How do I set up Auxdibot?',
               value: "Auxdibot comes ready-to-use straight from the moment the bot joins your server! Auxdibot can be set up automatically by running `/setup auto` to create channels for every feature on your server or you can use Auxdibot's commands to tweak the settings for your server and `/settings view` to see your changes.",
               inline: true,
            },
         ),
      disabled: new EmbedBuilder()
         .setColor(auxdibot.colors.denied)
         .setTitle('⛔ Disabled')
         .setDescription('This feature is disabled on this server!'),
      error: new EmbedBuilder()
         .setColor(auxdibot.colors.denied)
         .setTitle('⛔ Error!')
         .setDescription('An error occurred trying to do this. Try again later!'),
   };
   auxdibot.getMembers = async function () {
      return await this.guilds.cache.reduce(
         async (acc: Promise<number> | number, guild) =>
            (await acc) + (guild.memberCount || (await guild.fetch()).memberCount || 0),
         0,
      );
   };
   auxdibot.updateDiscordStatus = async function (guilds: number, message: string) {
      if (this.user)
         return this.user.setPresence({
            activities: [
               {
                  type: ActivityType.Custom,
                  name: 'Auxdibot',
                  url: 'https://bot.auxdible.me',
                  state: `${message} | ${guilds} servers`,
               },
            ],
         });
      return undefined;
   };

   const rest = new REST({
      version: '10',
   }).setToken(TOKEN);
   refreshInteractions(auxdibot, rest, CLIENT_ID);
   /********************************************************************************/
   // Listen for events
   console.log('-> Listening for events...');

   listenEvents(auxdibot);

   /********************************************************************************/
   // Schedule tasks
   console.log('-> Scheduling tasks...');

   scheduleExpirationChecks(auxdibot);
   scheduleRunSchedules(auxdibot);
   scheduleChannelUnlocks(auxdibot);
   scheduleClearMessageCache(auxdibot);
   createSubscribers(auxdibot);

   console.log('-> Logging into client...');
   auxdibot
      .login(TOKEN)
      .then(async () => {
         server(auxdibot);
         fetchAnalytics(auxdibot);
      })
      .catch((reason) => {
         console.error('! -> Error signing into into Auxdibot!');
         console.error(reason);
      });
})();
