/* eslint-disable @typescript-eslint/no-var-requires */
import { ActivityType, Client, Collection, EmbedBuilder, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Server from '@/mongo/model/server/Server';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { LogType } from '@/config/Log';
import { AuxdibotIntents } from '@/config/AuxdibotIntents';
import listenEvents from '@/bot/events/listenEvents';

// auxdibot/configure .env
dotenv.config();
export const TOKEN = process.env.DISCORD_BOT_TOKEN;
export const CLIENT_ID = process.env.DISCORD_BOT_CLIENT_ID;
export class AuxdibotClient {
   constructor() {
      if (!TOKEN) throw new Error('You need to include a discord token in .env!');
      if (!CLIENT_ID) throw new Error('You need to include a client id in .env!');
      /********************************************************************************/
      // Create Client

      const auxdibot = new Client({
         intents: AuxdibotIntents,
         presence: {
            activities: [
               {
                  type: ActivityType.Listening,
                  name: '[[loading ASMR intensifies]]',
               },
            ],
         },
      }) as Auxdibot;

      /********************************************************************************/
      // Declare client variables

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
            DENIED: 0x54cc31,
            CONSIDERED: 0xcc3131,
            APPROVED: 0xf2e876,
            ADDED: 0x31ccc4,
         },
      };
      auxdibot.embeds = {
         welcome: new EmbedBuilder()
            .setColor(auxdibot.colors.default)
            .setTitle('👋 Hello!')
            .setDescription(
               'I am Auxdibot. Thank you for inviting me to your server. I am currently still in development and many of my features are incomplete.' +
                  '\n\n• I am a **slash command only** bot! Type `/`, then click on the icon for Auxdibot to see all my available commands!' +
                  '\n• Do `/help` to see a list of all of my commands!' +
                  '\n• Or do `/help [command_name]` to view information about a specific command!',
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
                     name: `${this.guilds.cache.size.toLocaleString()} servers`,
                  },
               ],
            });
         return undefined;
      };
      /********************************************************************************/
      // Declare commands

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
            files: fs.readdirSync(path.join(__dirname, '../bot/commands')).filter((file) => file.endsWith('.js')),
         },
      ];

      for (const packageString of PACKAGES) {
         const packageFile = path.join(__dirname, '../bot/commands', packageString);
         if (fs.existsSync(packageFile)) {
            commandFiles.push({
               dir: packageString,
               files: fs.readdirSync(packageFile).filter((file) => file.endsWith('.js')),
            });
         }
      }
      for (const packageFile of commandFiles) {
         for (const file of packageFile.files) {
            const fileRequire = require(`../bot/commands/${packageFile.dir}/${file}`);
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
            console.log(`Refreshed ${commands.length} slash commands.`);
         })
         .catch((x) => {
            console.error('Failed to load commands!');
            console.error(x);
         });

      /********************************************************************************/
      // Declare buttons

      const buttons = [];
      const buttonFiles = fs.readdirSync(path.join(__dirname, '../bot/buttons')).filter((file) => file.endsWith('.js'));
      for (const file of buttonFiles) {
         const fileRequire = require(`../bot/buttons/${file}`);
         if (fileRequire) {
            buttons.push(fileRequire);
            if (auxdibot.buttons) {
               auxdibot.buttons.set(fileRequire.name, fileRequire);
            }
         }
      }
      /********************************************************************************/
      // Listen for events & login to bot
      listenEvents(auxdibot);

      auxdibot
         .login(TOKEN)
         .then(() => {
            console.log('Auxdibot is loaded!');
            if (auxdibot.updateDiscordStatus) auxdibot.updateDiscordStatus();
            setInterval(async () => {
               for (const guild of auxdibot.guilds.cache.values()) {
                  const server = await Server.findOrCreateServer(guild.id);
                  const serverData = await server.fetchData(),
                     settings = await server.fetchSettings();
                  if (!serverData) return;
                  const expired = serverData.checkExpired();
                  if (expired) {
                     for (const expiredPunishment of expired) {
                        await server.log(guild, {
                           type: LogType.PUNISHMENT_EXPIRED,
                           description: `Punishment ID ${expiredPunishment.punishment_id} has expired.`,
                           date_unix: Date.now(),
                           punishment: expiredPunishment,
                        });
                        switch (expiredPunishment.type) {
                           case 'ban':
                              await guild.bans.remove(expiredPunishment.user_id, 'Punishment expired.');
                              break;
                           case 'mute':
                              const member = guild.members.resolve(expiredPunishment.user_id);
                              if (!member || !settings.mute_role) break;
                              await member.roles.remove(settings.mute_role);
                              break;
                        }
                     }
                  }
               }
            }, 60000);
         })
         .catch((reason) => {
            console.log('Error signing into into Auxdibot!');
            console.error(reason);
         });
      return auxdibot;
   }
}
