import { servers } from '@prisma/client';
import { Guild, GuildMember, User } from 'discord.js';

export interface BaseAuxdibotCommandData {
   dmCommand?: boolean;
   date: Date;
}
export interface DMAuxdibotCommandData extends BaseAuxdibotCommandData {
   dmCommand?: true;
   date: Date;
   user: User;
}
export interface GuildAuxdibotCommandData extends BaseAuxdibotCommandData {
   dmCommand?: false;
   date: Date;
   guild: Guild;
   guildData: servers;
   member: GuildMember;
}
