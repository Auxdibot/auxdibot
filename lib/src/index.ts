import 'module-alias/register';
import { ActivityType, Client, Collection, EmbedBuilder, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { AuxdibotIntents } from '@/constants/bot/AuxdibotIntents';
import listenEvents from '@/bot/events/listenEvents';
import connectPrisma from './util/connectPrisma';
import findOrCreateServer from './modules/server/findOrCreateServer';
import handleLog from './util/handleLog';
import { LogAction, PunishmentType } from '@prisma/client';
import { punishmentInfoField } from './modules/features/moderation/punishmentInfoField';
import { AuxdibotPartials } from './constants/bot/AuxdibotPartials';

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
   /********************************************************************************/
   // Declare commands
   console.log('-> Declaring commands...');
   const rest = new REST({
      version: '10',
   }).setToken(TOKEN);

   const commands = [];
   const PACKAGES = [
      'general',
      'moderation',
      'settings',
      'permissions',
      'embeds',
      'roles',
      'suggestions',
      'levels',
      'starboard',
   ];
   const commandFiles = [
      {
         dir: '',
         files: fs.readdirSync(path.join(__dirname, '/bot/commands')).filter((file) => file.endsWith('.js')),
      },
   ];

   for (const packageString of PACKAGES) {
      const packageFile = path.join(__dirname, '/bot/commands', packageString);
      if (fs.existsSync(packageFile)) {
         commandFiles.push({
            dir: packageString,
            files: fs.readdirSync(packageFile).filter((file) => file.endsWith('.js')),
         });
      }
   }
   for (const packageFile of commandFiles) {
      for (const file of packageFile.files) {
         const fileRequire = await import(`./bot/commands/${packageFile.dir}/${file}`);
         if (fileRequire.data) {
            commands.push(fileRequire.data);
            if (auxdibot.commands) {
               auxdibot.commands.set(fileRequire.data.name, fileRequire);
            }
         }
      }
   }
   rest
      .put(Routes.applicationCommands(CLIENT_ID), {
         body: commands,
      })
      .then(() => {
         console.log(`-> Refreshed ${commands.length} slash commands.`);
      })
      .catch((x) => {
         console.error('! -> Failed to load commands!');
         console.error(x);
      });

   /********************************************************************************/
   // Declare buttons
   console.log('-> Declaring button interactions...');
   const buttons = [];
   const buttonFiles = fs.readdirSync(path.join(__dirname, '/bot/buttons')).filter((file) => file.endsWith('.js'));
   for (const file of buttonFiles) {
      const fileRequire = await import(`./bot/buttons/${file}`);
      if (fileRequire) {
         buttons.push(fileRequire);
         if (auxdibot.buttons) {
            auxdibot.buttons.set(fileRequire.name, fileRequire);
         }
      }
   }
   /********************************************************************************/
   // Listen for events & login to bot
   console.log('-> Listening for events...');

   listenEvents(auxdibot);

   console.log('-> Logging into client...');
   auxdibot
      .login(TOKEN)
      .then(() => {
         if (auxdibot.updateDiscordStatus) auxdibot.updateDiscordStatus();
         setInterval(async () => {
            for (const guild of auxdibot.guilds.cache.values()) {
               const server = await findOrCreateServer(auxdibot, guild.id);
               if (!server) return;
               const expired = server.punishments.filter((punishment) => {
                  if (
                     !punishment.expired &&
                     punishment.expires_date_unix &&
                     punishment.expires_date_unix * 1000 > Date.now()
                  ) {
                     punishment.expired = true;
                     return punishment;
                  }
               });
               if (expired) {
                  for (const expiredPunishment of expired) {
                     await handleLog(
                        auxdibot,
                        guild,
                        {
                           type: LogAction.PUNISHMENT_EXPIRED,
                           description: `Punishment ID ${expiredPunishment.punishmentID} has expired.`,
                           date_unix: Date.now(),
                           userID: auxdibot.user.id,
                        },
                        [punishmentInfoField(expiredPunishment)],
                     );
                     switch (expiredPunishment.type) {
                        case PunishmentType.BAN:
                           await guild.bans.remove(expiredPunishment.userID, 'Punishment expired.');
                           break;
                        case PunishmentType.MUTE:
                           const member = guild.members.resolve(expiredPunishment.userID);
                           if (!member || !server.mute_role) break;
                           member.roles.remove(server.mute_role);
                           break;
                     }
                  }
                  await auxdibot.database.servers.update({
                     where: { serverID: server.serverID },
                     data: { punishments: server.punishments },
                  });
               }
            }
         }, 60000);
      })
      .catch((reason) => {
         console.error('! -> Error signing into into Auxdibot!');
         console.error(reason);
      });
})();
