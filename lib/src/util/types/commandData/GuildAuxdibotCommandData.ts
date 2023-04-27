import {Guild, GuildMember} from "discord.js";
import {IServer, ServerMethods} from "../../../mongo/model/Server";
import BaseAuxdibotCommandData from "./BaseAuxdibotCommandData";
import {HydratedDocument} from "mongoose";

export default interface GuildAuxdibotCommandData extends BaseAuxdibotCommandData {
    dmCommand?: false;
    date: Date;
    guild: Guild;
    guildData: HydratedDocument<IServer, ServerMethods>;
    member: GuildMember;
}
