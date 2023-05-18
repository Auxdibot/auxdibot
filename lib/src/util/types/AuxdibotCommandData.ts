import { IServer, IServerMethods } from "@models/server/Server";
import { Guild, GuildMember, User } from "discord.js";
import { HydratedDocument } from "mongoose";

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
   guildData: HydratedDocument<IServer, IServerMethods>;
   member: GuildMember;
}