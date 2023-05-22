/* eslint-disable @typescript-eslint/no-var-requires */
import { ActivityType, Client, Collection, GatewayIntentBits, Partials, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Server from '@models/server/Server';
import { IAuxdibot } from '@util/types/templates/IAuxdibot';
import { LogType } from '@util/types/enums/Log';

// Configure .env
dotenv.config();
export const TOKEN = process.env.DISCORD_BOT_TOKEN;
export const CLIENT_ID = process.env.DISCORD_BOT_CLIENT_ID;
export class AuxdibotClient {
   constructor() {
      if (!TOKEN) throw new Error('You need to include a discord token in .env!');
      if (!CLIENT_ID) throw new Error('You need to include a client id in .env!');
      /********************************************************************************/
      // Create Client

      const client: IAuxdibot = new Client({
         intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildModeration,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.DirectMessageReactions,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
         ],
         partials: [Partials.Channel, Partials.Reaction, Partials.Message, Partials.GuildMember, Partials.User],
         presence: {
            activities: [
               {
                  type: ActivityType.Listening,
                  name: '[[loading ASMR intensifies]]',
               },
            ],
         },
      });

      /********************************************************************************/
      // Declare client variables

      client.commands = new Collection();
      client.buttons = new Collection();
      client.getMembers = async function () {
         return await this.guilds.cache.reduce(
            async (acc: Promise<number> | number, guild) =>
               (await acc) + (guild.memberCount || (await guild.fetch()).memberCount || 0),
            0,
         );
      };
      client.updateDiscordStatus = async function () {
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
      const PACKAGES = ['general', 'moderation', 'settings', 'permissions', 'embeds', 'roles', 'suggestions', 'levels'];
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
               if (client.commands) {
                  client.commands.set(fileRequire.data.name, fileRequire);
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
            if (client.buttons) {
               client.buttons.set(fileRequire.name, fileRequire);
            }
         }
      }

      /********************************************************************************/
      // Declare events

      const eventFiles = fs.readdirSync(path.join(__dirname, '../bot/events')).filter((file) => file.endsWith('.js'));

      for (const file of eventFiles) {
         const event = require(`../bot/events/${file}`);
         if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
         } else {
            client.on(event.name, async (...args) => await event.execute(...args, client));
         }
      }

      client
         .login(TOKEN)
         .then(() => {
            console.log('Auxdibot is loaded!');
            if (client.updateDiscordStatus) client.updateDiscordStatus();
            setInterval(async () => {
               for (const guild of client.guilds.cache.values()) {
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
      return client;
   }
}
