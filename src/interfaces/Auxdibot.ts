import {
   BaseInteraction,
   Client,
   ClientPresence,
   Collection,
   EmbedBuilder,
   Message,
   InteractionReplyOptions,
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
export interface Auxdibot extends Client {
   commands: Collection<string, AuxdibotCommand>;
   buttons: Collection<string, AuxdibotButton>;
   modals: Collection<string, AuxdibotModal>;
   select_menus: Collection<string, AuxdibotSelectMenu>;
   database: PrismaClient;
   scheduler: ToadScheduler;
   messages: Collection<bigint, CachedMessage>;
   spam_detections: Collection<[string, bigint], Collection<bigint, CachedMessage>>;
   attachments_detections: Collection<[string, bigint], Collection<bigint, CachedMessage>>;
   invites_detections: Collection<[string, bigint], Collection<bigint, CachedMessage>>;
   subscriber: Subscriber;
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
   embeds: {
      welcome: EmbedBuilder;
      disabled: EmbedBuilder;
      error: EmbedBuilder;
   };
   getMembers?(): Promise<number>;
   updateDiscordStatus?(guilds: number, message: string): Promise<ClientPresence | undefined>;
   createReply?(
      interaction: BaseInteraction,
      data: InteractionReplyOptions,
      options?: AuxdibotReplyOptions,
   ): Promise<Message<boolean>> | Promise<void>;
}
