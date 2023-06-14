import { Client, ClientPresence, Collection, EmbedBuilder } from 'discord.js';
import AuxdibotCommand from './commands/AuxdibotCommand';
import AuxdibotButton from './buttons/AuxdibotButton';
import { PrismaClient } from '@prisma/client';
import { ToadScheduler } from 'toad-scheduler';
export interface Auxdibot extends Client {
   commands: Collection<string, AuxdibotCommand>;
   buttons: Collection<string, AuxdibotButton>;
   database: PrismaClient;
   scheduler: ToadScheduler;
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
}
