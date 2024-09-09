import {
   BaseInteraction,
   Client,
   ClientPresence,
   Collection,
   EmbedBuilder,
   Message,
   InteractionReplyOptions,
   InteractionResponse,
} from 'discord.js';
import AuxdibotCommand from './commands/AuxdibotCommand';
import AuxdibotButton from './buttons/AuxdibotButton';
import { PrismaClient } from '@prisma/client';
import { ToadScheduler } from 'toad-scheduler';
import { CachedMessage } from './messages/CachedMessage';
import AuxdibotSelectMenu from './menus/AuxdibotSelectMenu';
import AuxdibotModal from './modals/AuxdibotModal';
import Subscriber from '@/modules/features/notifications/Subscriber';
import { AuxdibotReplyOptions } from './AuxdibotReplyOptions';
import { BuildSession } from './messages/BuildSession';
import { AuxdibotContextMenu } from './contexts/AuxdibotContextMenu';
/**
 * Represents the Auxdibot interface.
 * @interface Auxdibot
 * @extends Client
 */
export interface Auxdibot extends Client {
   /**
    * Collection of commands registered in Auxdibot.
    */
   commands: Collection<string, AuxdibotCommand>;

   /**
    * Collection of buttons registered in Auxdibot.
    */
   buttons: Collection<string, AuxdibotButton>;

   /**
    * Collection of modals registered in Auxdibot.
    */
   modals: Collection<string, AuxdibotModal>;

   /**
    * Collection of select menus registered in Auxdibot.
    */
   select_menus: Collection<string, AuxdibotSelectMenu>;
   /**
    * Collection of context menus registered in Auxdibot.
    */
   context_menus: Collection<string, AuxdibotContextMenu>;

   /**
    * Prisma client for database operations.
    */
   database: PrismaClient;

   /**
    * Scheduler for scheduling tasks in Auxdibot.
    */
   scheduler: ToadScheduler;

   /**
    * Collection of cached messages in Auxdibot.
    */
   messages: Collection<bigint, CachedMessage>;

   /**
    * Collection of spam detections in Auxdibot.
    */
   spam_detections: Collection<[string, bigint], Collection<bigint, CachedMessage>>;

   /**
    * Collection of attachments detections in Auxdibot.
    */
   attachments_detections: Collection<[string, bigint], Collection<bigint, CachedMessage>>;

   /**
    * Collection of invites detections in Auxdibot.
    */
   invites_detections: Collection<[string, bigint], Collection<bigint, CachedMessage>>;
   /**
    * Collection of starboard timeouts in Auxdibot.
    */
   starboard_timeout: Collection<string, number>;
   /**
    * Collection of level events attended in Auxdibot
    */
   level_events: [string, string][];
   /**
    * Subscriber for handling notifications in Auxdibot.
    */
   subscriber: Subscriber;
   /**
    * Keeps track of all embed building sessions for Auxdibot.
    */
   build_sessions: Collection<string, BuildSession>;
   /**
    * Object containing color values used in Auxdibot.
    */
   colors: {
      accept: number;
      denied: number;
      info: number;
      default: number;
      punishment: number;
      log: number;
      reaction_role: number;
      levels: number;
      suggestions: {
         WAITING: number;
         DENIED: number;
         CONSIDERED: number;
         APPROVED: number;
         ADDED: number;
      };
   };

   /**
    * Object containing embed builders used in Auxdibot.
    */
   embeds: {
      welcome: EmbedBuilder;
      disabled: EmbedBuilder;
      error: EmbedBuilder;
   };

   /**
    * Function to get the total number of members in Auxdibot.
    * @returns A promise that resolves to the number of members.
    */
   getMembers?(): Promise<number>;

   /**
    * Function to update the Discord status of Auxdibot.
    * @param guilds - The number of guilds Auxdibot is connected to.
    * @param message - The status message to be displayed.
    * @returns A promise that resolves to the updated client presence.
    */
   updateDiscordStatus?(guilds: number, message: string): Promise<ClientPresence | undefined>;

   /**
    * Function to create a reply to an interaction in Auxdibot.
    * @param interaction - The base interaction object.
    * @param data - The reply data to be sent.
    * @param options - Additional options for the reply.
    * @returns A promise that resolves to the sent message or interaction response.
    */
   createReply?(
      interaction: BaseInteraction,
      data: InteractionReplyOptions,
      options?: AuxdibotReplyOptions,
   ): Promise<Message<boolean> | InteractionResponse<boolean>>;
}
