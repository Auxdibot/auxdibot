import {
   ActivityType,
   BaseInteraction,
   ChannelType,
   Client,
   Collection,
   EmbedBuilder,
   Guild,
   InteractionReplyOptions,
   MessagePayload,
   REST,
} from 'discord.js';
import { AuxdibotIntents } from './constants/bot/AuxdibotIntents';
import { AuxdibotPartials } from './constants/bot/AuxdibotPartials';
import { Prisma, PrismaClient } from '@prisma/client';
import { ToadScheduler } from 'toad-scheduler';
import Subscriber from './modules/features/notifications/Subscriber';
import { CustomEmojis } from './constants/bot/CustomEmojis';
import { AuxdibotReplyOptions } from './interfaces/AuxdibotReplyOptions';
import findOrCreateServer from './modules/server/findOrCreateServer';
import AuxdibotCommand from './interfaces/commands/AuxdibotCommand';
import AuxdibotSelectMenu from './interfaces/menus/AuxdibotSelectMenu';
import AuxdibotButton from './interfaces/buttons/AuxdibotButton';
import AuxdibotModal from './interfaces/modals/AuxdibotModal';
import { AuxdibotContextMenu } from './interfaces/contexts/AuxdibotContextMenu';
import { BuildSession } from './interfaces/messages/BuildSession';
import refreshInteractions from './interaction/refreshInteractions';
import listenEvents from './interaction/events/listenEvents';
import createBuildSessionSchedule from './modules/features/embeds/createBuildSessionSchedule';
import scheduleStarboardTimeoutClear from './modules/features/starboard/scheduleStarboardTimeoutClear';
import scheduleChannelUnlocks from './modules/features/moderation/lock/scheduleChannelUnlocks';
import scheduleRunSchedules from './modules/features/schedule/scheduleRunSchedules';
import scheduleExpirationChecks from './modules/features/moderation/scheduleExpirationChecks';
import createSubscribers from './modules/features/notifications/createSubscribers';
import server from './server/server';
import fetchAnalytics from './modules/analytics/fetchAnalytics';

import { LogOptions } from './interfaces/log/LogOptions';
import addLog from './modules/logs/updateLog';
import { LogData } from './constants/bot/log/LogData';
import scheduleRunReminders from './modules/features/reminders/scheduleRunReminders';
import { LRUCache } from 'lru-cache';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_BOT_CLIENT_ID;

const DETECTION_CACHE_OPTIONS = { ttl: 1000 * 120, ttlAutopurge: true };
/**
 * Represents the Auxdibot class.
 * @class Auxdibot
 * @extends Client
 */
export class Auxdibot extends Client {
   /**
    * Prisma client for database operations.
    */
   database: PrismaClient = new PrismaClient();

   /**
    * Collection of commands registered in Auxdibot.
    */
   commands: Collection<string, AuxdibotCommand> = new Collection();

   /**
    * Collection of buttons registered in Auxdibot.
    */
   buttons: Collection<string, AuxdibotButton> = new Collection();

   /**
    * Collection of select menus registered in Auxdibot.
    */
   select_menus: Collection<string, AuxdibotSelectMenu> = new Collection();

   /**
    * Collection of modals registered in Auxdibot.
    */
   modals: Collection<string, AuxdibotModal> = new Collection();

   /**
    * Collection of context menus registered in Auxdibot.
    */
   context_menus: Collection<string, AuxdibotContextMenu> = new Collection();

   /**
    * Cache of spam detections in Auxdibot.
    */
   spam_detections = new LRUCache<[string, bigint], string[]>(DETECTION_CACHE_OPTIONS);

   /**
    * Cache of invites detections in Auxdibot.
    */
   invites_detections = new LRUCache<[string, bigint], string[]>(DETECTION_CACHE_OPTIONS);

   /**
    * Cache of attachments detections in Auxdibot.
    */
   attachments_detections = new LRUCache<[string, bigint], string[]>(DETECTION_CACHE_OPTIONS);

   /**
    * Collection of starboard timeouts in Auxdibot.
    */
   starboard_timeout: Collection<string, number> = new Collection();

   /**
    * Collection of level events attended in Auxdibot.
    */
   level_events: [string, string][] = [];

   /**
    * Scheduler for scheduling tasks in Auxdibot.
    */
   scheduler: ToadScheduler = new ToadScheduler();

   /**
    * Subscriber for handling notifications in Auxdibot.
    */
   subscriber: Subscriber = new Subscriber();

   /**
    * Keeps track of all embed building sessions for Auxdibot.
    */
   build_sessions: Collection<string, BuildSession> = new Collection();

   /**
    * Object containing color values used in Auxdibot.
    */
   colors = {
      accept: 0x8bc34a,
      denied: 0xf44336,
      info: 0x00bcd4,
      default: 0xfe8a00,
      punishment: 0x9c0e11,
      log: 0xf9f3d2,
      reaction_role: 0xf3c810,
      levels: 0xf1c71b,
      premium: 0xeab308,
      suggestions: {
         WAITING: 0x5c5c5c,
         DENIED: 0xcc3131,
         APPROVED: 0x54cc31,
         CONSIDERED: 0xf2e876,
         ADDED: 0x31ccc4,
      },
   };

   /**
    * Object containing embed builders used in Auxdibot.
    */
   embeds = {
      welcome: new EmbedBuilder()
         .setColor(this.colors.default)
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
         .setColor(this.colors.denied)
         .setTitle('⛔ Disabled')
         .setDescription('This feature is disabled on this server!'),
      error: new EmbedBuilder()
         .setColor(this.colors.denied)
         .setTitle('⛔ Error!')
         .setDescription('An error occurred trying to do this. Try again later!'),
      voted: new EmbedBuilder()
         .setColor(this.colors.premium)
         .setTitle('Vote Received - Top.GG')
         .setDescription(
            'Thank you for supporting Auxdibot on Top.GG! You have received temporary benefits for voting.',
         )
         .setFields({
            name: 'What Benefits?',
            value: 'You have received\n\n* Expanded storage for servers you own (25%+ more storage!)\n* A fancy check mark on the Bot dashboard! 😳',
         }),
      premium_required: new EmbedBuilder()
         .setColor(this.colors.premium)
         .setTitle(`${CustomEmojis.PREMIUM} Auxdibot Premium Required`)
         .setDescription(
            'You need to be a premium user to use this feature! Consider supporting Auxdibot by purchasing Auxdibot Premium.',
         ),
   };
   /**
    * Creates an instance of Auxdibot, and initializes the instance, using the DISCORD_BOT_TOKEN and DISCORD_BOT_CLIENT_ID
    */
   constructor() {
      if (!TOKEN) throw new Error('You need to include a discord token in .env!');
      if (!CLIENT_ID) throw new Error('You need to include a client id in .env!');
      super({
         intents: AuxdibotIntents,
         partials: AuxdibotPartials,
         presence: {
            activities: [
               {
                  type: ActivityType.Custom,
                  name: 'Auxdibot',
                  url: 'https://auxdibot.xyz',
                  state: `⌚ Loading...`,
               },
            ],
         },
      });
      this.init();
   }
   /**
    * Initializes the Auxdibot instance, connecting to the Prisma client, setting up interactions, and listening for events.
    */
   async init() {
      console.log(`-> Connecting Prisma Client...`);
      await this.connectPrisma();
      console.log('-> Declaring client variables...');
      const rest = new REST({
         version: '10',
      }).setToken(TOKEN);
      refreshInteractions(this, rest, CLIENT_ID);
      console.log('-> Listening for events...');
      listenEvents(this);
      console.log('-> Scheduling tasks...');

      scheduleExpirationChecks(this);
      scheduleRunSchedules(this);
      scheduleChannelUnlocks(this);
      scheduleStarboardTimeoutClear(this);
      createBuildSessionSchedule(this);
      scheduleRunReminders(this);
      this.subscriber.twitchInit().then(() => createSubscribers(this));

      console.log('-> Logging into client...');
      this.login(TOKEN)
         .then(async () => {
            server(this);
            fetchAnalytics(this);
            this.application.entitlements
               .createTest({ sku: process.env.PREMIUM_SKU_ID, user: '684762447399354433' })
               .catch(() => undefined);
         })
         .catch((reason) => {
            console.error('\x1b[31m! -> Error signing into into Auxdibot!\x1b[0m');
            console.error(reason);
         });
   }

   /**
    * Function to connect to the Prisma client.
    * @returns A promise that resolves when the connection is established.
    */
   async connectPrisma() {
      try {
         await this.database.$connect().then(() => console.log(`\x1b[32m-> Connected to MongoDB!\x1b[0m`));
      } catch (x) {
         console.error('\x1b[31m! -> There was an issue trying to connect to MongoDB using Prisma!\x1b[0m');
         console.error(x);
         return undefined;
      }
   }

   /**
    * Function to get the total number of members in Auxdibot.
    * @returns A promise that resolves to the number of members.
    */
   async getMembers() {
      return await this.guilds.cache.reduce(
         async (acc: Promise<number> | number, guild) =>
            (await acc) + (guild.memberCount || (await guild.fetch()).memberCount || 0),
         0,
      );
   }

   /**
    * Function to update the Discord status of Auxdibot.
    * @param guilds - The number of guilds Auxdibot is connected to.
    * @param message - The status message to be displayed.
    * @returns A promise that resolves to the updated client presence.
    */
   async updateDiscordStatus(guilds: number, message: string) {
      if (this.user)
         return this.user.setPresence({
            activities: [
               {
                  type: ActivityType.Custom,
                  name: 'Auxdibot',
                  url: 'https://auxdibot.xyz',
                  state: `${message} | ${guilds} servers`,
               },
            ],
         });
      return undefined;
   }

   /**
    * Function to create a reply to an interaction in Auxdibot.
    * @param interaction - The base interaction object.
    * @param data - The reply data to be sent.
    * @param options - Additional options for the reply.
    * @returns A promise that resolves to the sent message or interaction response.
    */
   async createReply(interaction: BaseInteraction, data: InteractionReplyOptions, options?: AuxdibotReplyOptions) {
      if (interaction.guildId && interaction.isChatInputCommand() && !options?.noOutputChannel) {
         const server = options?.data || (await findOrCreateServer(this, interaction.guildId));
         if (!server) return;
         const permission = server.command_permissions.filter((cp) => cp.command == interaction.commandName),
            commandPermission = permission.find((i) => !i.subcommand && !i.group),
            groupPermission = permission.find(
               (i) => i.group == interaction.options.getSubcommandGroup(false) && !i.subcommand,
            ),
            subcommandPermission = permission.find(
               (i) =>
                  i.group == interaction.options.getSubcommandGroup(false) &&
                  i.subcommand == interaction.options.getSubcommand(false),
            );
         if (
            commandPermission?.channel_output ||
            groupPermission?.channel_output ||
            subcommandPermission?.channel_output
         ) {
            const channel = await interaction.guild?.channels
               .fetch(
                  subcommandPermission?.channel_output ||
                     groupPermission?.channel_output ||
                     commandPermission?.channel_output,
               )
               .catch(() => undefined);
            if (channel && channel.isTextBased()) {
               return channel
                  .send(new MessagePayload(channel, data))
                  .then((msg) => {
                     this.createReply(
                        interaction,
                        {
                           content: `Redirected to: https://discord.com/channels/${interaction.guildId}/${channel.id}/${msg.id}`,
                           ephemeral: true,
                        },
                        { noOutputChannel: true },
                     );
                  })
                  .catch(() => {
                     this.log(
                        interaction.guild,
                        {
                           type: 'ERROR',
                           description: `An error occurred when attempting to run a command.`,
                           userID: interaction.user.id,
                           date: new Date(),
                        },
                        {
                           fields: [
                              {
                                 name: 'Error Message',
                                 value: `Failed to redirect command output to <#${channel.id}>`,
                                 inline: false,
                              },
                           ],
                        },
                     );
                     this.createReply(interaction, data, { noOutputChannel: true });
                  });
            }
         }
      }
      return (
         interaction.isRepliable() && interaction.deferred
            ? interaction.editReply(data)
            : interaction.isRepliable() && !interaction.replied
            ? interaction.reply(data)
            : interaction.channel.send(new MessagePayload(interaction.channel, data))
      ).catch((x) => {
         console.error('! -> Auxdibot failed to send a message!');
         console.error(x);
         return null;
      });
   }
   /**
    * Logs an action to the server's log channel.
    * @param guild The guild to log the action in.
    * @param log The log to be added to the server's log channel.
    * @param options Additional options for the log.
    * @returns A promise that resolves to the log that was added to the server's log channel.
    */
   async log(guild: Guild, log: Omit<Prisma.logsCreateInput, 'serverID'>, { fields, user_avatar }: LogOptions = {}) {
      const server = await findOrCreateServer(this, guild.id);
      if (server.filtered_logs.indexOf(log.type) != -1) return;
      this.database.analytics
         .upsert({
            where: { botID: this.user.id },
            create: { botID: this.user.id },
            update: { logs: { increment: 1 } },
         })
         .catch(() => undefined);
      return await addLog(this, guild, { ...log, serverID: guild.id })
         .then(async () => {
            const user = log.userID ? await guild.client.users.fetch(log.userID) : undefined;
            const logEmbed = new EmbedBuilder()
               .setColor(LogData[log.type].color || this.colors.log)
               .setAuthor({ name: user ? user.displayName : '', iconURL: user ? user.avatarURL() : undefined })
               .setFooter({
                  text: `Log Action: ${log.type
                     .split('_')
                     .map((i) => i[0] + i.slice(1).toLowerCase())
                     .join(' ')}`,
               })
               .setTitle(LogData[log.type].name || null)
               .setDescription(`${log.description}`)
               .setTimestamp(new Date(log.date) || Date.now());
            if (fields) {
               logEmbed.setFields(...fields);
            }
            if (user_avatar && user) {
               const avatar = user.avatarURL({ size: 128 });
               if (avatar) {
                  logEmbed.setThumbnail(avatar);
               }
            }
            const logChannel = await guild.channels.fetch(server.log_channel).catch(() => undefined);
            if (!logChannel || logChannel.type != ChannelType.GuildText) return log;
            await logChannel.send({ embeds: [logEmbed] }).catch(() => undefined);
            return log;
         })
         .catch(() => undefined);
   }
   /**
    * Checks if a user has voted in the last week.
    * @param userID The ID of the user to check if they have voted.
    * @returns A boolean indicating if the user has voted in the last week.
    */
   async hasVoted(userID: string) {
      return await this.database.users.findFirst({ where: { userID }, select: { voted_date: true } }).then((data) => {
         if (!data?.voted_date) return false;
         const oneWeekAgo = new Date();
         oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

         return data.voted_date.valueOf() >= oneWeekAgo.valueOf();
      });
   }
   async getLimit(limit: { default: number; voted: number }, guild?: Guild, user?: string) {
      if (!guild && !user) return limit.default;
      const premium = await this.fetchPremiumSubscriptionUser(guild.id);
      return premium
         ? 500
         : (await this.hasVoted(guild.ownerId ?? user).catch(() => false))
         ? limit.voted
         : limit.default;
   }
   /**
    * Checks if the length of an array is less than a specified limit.
    * Optionally, it can purge the prior elements of the array if the limit is exceeded.
    *
    * @param v - The array to be checked.
    * @param limit - The maximum allowed length of the array.
    * @param purgePrior - Optional. If true, removes the prior elements of the array if the limit is exceeded. Default is false.
    * @returns True if the length of the array is less than the limit, false otherwise. If purgePrior is true and the limit is exceeded, returns 'spliced'.
    */
   async testLimit(
      v: unknown[],
      limit: { default: number; voted: number },
      guild?: Guild,
      purgePrior?: boolean,
      user?: string,
   ) {
      const value = await this.getLimit(limit, guild, user);
      if (v.length < value) return true;
      if (purgePrior) {
         v.splice(0, 1);
         return 'spliced';
      }
      return false;
   }
   /**
    * Fetches the premium subscription entitlement of a user.
    * @param userID The ID of the user to fetch the premium subscription status of.
    * @returns A promise that resolves to the premium subscription entitlement of the user.
    */
   async fetchPremiumSubscription(userID: string) {
      try {
         const entitlement = await this.application.entitlements.fetch({
            user: userID,
            skus: [process.env.PREMIUM_SKU_ID],
         });
         return entitlement.find((val) => val.isActive());
      } catch (x) {
         return undefined;
      }
   }
   async fetchPremiumSubscriptionUser(guildID: string) {
      try {
         const premium_users = await this.database.users.findMany({ where: { premium_servers: { has: guildID } } });
         for (const user of premium_users) {
            if (await this.fetchPremiumSubscription(user.userID)) {
               return user.userID;
            }
         }
         return undefined;
      } catch (x) {
         return undefined;
      }
   }
}
