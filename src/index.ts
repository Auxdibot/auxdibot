import { ToadScheduler } from 'toad-scheduler';
import 'module-alias/register';
import { ActivityType, Client, Collection, EmbedBuilder, REST } from 'discord.js';

import dotenv from 'dotenv';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { AuxdibotIntents } from '@/constants/bot/AuxdibotIntents';
import listenEvents from '@/interaction/events/listenEvents';
import connectPrisma from './modules/database/connectPrisma';
import { AuxdibotPartials } from './constants/bot/AuxdibotPartials';
import refreshInteractions from './interaction/refreshInteractions';
import scheduleExpirationChecks from './modules/features/moderation/scheduleExpirationChecks';
import scheduleAnalyticsSend from './modules/scheduleAnalyticsSend';

dotenv.config();
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
               type: ActivityType.Listening,
               name: '/help modules | loading...',
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
   auxdibot.scheduler = new ToadScheduler();
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
         .setTitle('👋 Hello!')
         .setDescription(
            `I'm Auxdibot! I'm a multipurpose Discord bot, developed by Auxdible. You can do \`/help modules\` at any time to view all of my modules, and \`/help command\` to view information about a specific command. Visit my home site & dashboard [here](${process.env.BOT_HOMEPAGE})!`,
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
   auxdibot.updateDiscordStatus = async function () {
      if (this.user)
         return this.user.setPresence({
            activities: [
               {
                  type: ActivityType.Watching,
                  name: `/help modules | ${this.guilds.cache.size.toLocaleString()} servers`,
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
   scheduleAnalyticsSend(auxdibot);

   console.log('-> Logging into client...');
   auxdibot
      .login(TOKEN)
      .then(async () => await auxdibot.updateDiscordStatus())
      .catch((reason) => {
         console.error('! -> Error signing into into Auxdibot!');
         console.error(reason);
      });
})();
