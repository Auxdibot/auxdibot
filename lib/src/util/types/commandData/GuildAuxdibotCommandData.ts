import { Guild, GuildMember } from 'discord.js';
import { IServer, IServerMethods } from '../../../mongo/model/server/Server';
import BaseAuxdibotCommandData from './BaseAuxdibotCommandData';
import { HydratedDocument } from 'mongoose';

export default interface GuildAuxdibotCommandData extends BaseAuxdibotCommandData {
   dmCommand?: false;
   date: Date;
   guild: Guild;
   guildData: HydratedDocument<IServer, IServerMethods>;
   member: GuildMember;
}
