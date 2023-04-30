import {HydratedDocument, Schema} from "mongoose";
import {GuildMember} from "discord.js";
import {IServer, ServerMethods} from "../model/Server";


export interface IServerMember {
    discord_id: String;
    in_server: boolean;
    sticky_roles: string[];
    experience: number;
}
export interface IServerMemberMethods {
    leaveServer(member: GuildMember, server: IServer): Promise<boolean>;
    joinServer(member: GuildMember, server: IServer): Promise<boolean>;
}
const serverMemberSchema = new Schema<IServerMember, IServerMemberMethods>({
    discord_id: { type: String, required: true },
    experience: { type: Number, default: 0 },
    sticky_roles: { type: [String], default: [] },
    in_server: { type: Boolean, default: true }
}, { _id: false });
serverMemberSchema.method("leaveServer", async function(member: GuildMember, server: HydratedDocument<IServer, ServerMethods>) {
    if (member.roles) {
        this.sticky_roles = [];
        member.roles.cache.forEach((role) => server && server.settings.sticky_roles.indexOf(role.id) != -1 ? this.sticky_roles.push(role.id) : undefined);
    }
    this.in_server = false;
    return true;
});
serverMemberSchema.method("joinServer", async function(member: GuildMember, server: HydratedDocument<IServer, ServerMethods>): Promise<boolean> {
    this.in_server = true;
    this.sticky_roles.forEach((role: string) => server && server.settings.sticky_roles.indexOf(role) != -1 ? member.roles.add(role).catch(() => undefined) : undefined);
    await server.save();
    return true;
})
export default serverMemberSchema;