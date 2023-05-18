import { GuildMember } from 'discord.js';
import mongoose, { Schema } from 'mongoose';
import calcXP from '@util/functions/calcXP';

export interface IServerMember {
   discord_id: string;
   server_id: mongoose.ObjectId;
   in_server: boolean;
   sticky_roles: string[];
   xp: number;
   xpTill: number;
   level: number;
   suggestions_banned: boolean;
}
export interface IServerMemberMethods {
   leaveServer(member: GuildMember): Promise<boolean>;
   joinServer(member: GuildMember): Promise<boolean>;
   takeXP(xp: number): number;
   addXP(xp: number): number;
}
export type IServerMemberModel = mongoose.Model<IServerMember, unknown, IServerMemberMethods>;
export const ServerMemberSchema = new Schema<IServerMember, IServerMemberModel>({
   discord_id: { type: String, required: true },
   server_id: { type: mongoose.Schema.Types.ObjectId, ref: 'server', required: true },
   xp: { type: Number, default: 0 },
   xpTill: { type: Number, default: 0 },
   level: { type: Number, default: 0 },
   sticky_roles: { type: [String], default: [] },
   in_server: { type: Boolean, default: true },
   suggestions_banned: { type: Boolean, default: false },
});

ServerMemberSchema.method('leaveServer', async function (member: GuildMember) {
   const server = await this.populate('server_id')
      .then((doc: any) => doc.server_id)
      .catch(() => undefined);
   if (!server) return false;
   const settings = await server.fetchSettings();
   if (member.roles) {
      this.sticky_roles = [];
      member.roles.cache.forEach(async (role) =>
         server && settings.sticky_roles.indexOf(role.id) != -1 ? this.sticky_roles.push(role.id) : undefined,
      );
   }
   this.in_server = false;
   await this.save();
   return true;
});
ServerMemberSchema.method('joinServer', async function (member: GuildMember): Promise<boolean> {
   const server = await this.populate('server_id')
      .then((doc: any) => doc.server_id)
      .catch(() => undefined);
   if (!server) return false;
   const settings = await server.fetchSettings();
   this.in_server = true;
   this.sticky_roles.forEach(async (role: string) =>
      server && settings.sticky_roles.indexOf(role) != -1 ? member.roles.add(role).catch(() => undefined) : undefined,
   );
   await this.save();
   return true;
});
ServerMemberSchema.method('takeXP', function (xp: number) {
   this.xp -= xp;
   this.xpTill -= xp;
   while (this.xpTill < 0) {
      this.level--, (this.xpTill += calcXP(this.level));
   }

   return this.level;
});
ServerMemberSchema.method('addXP', function (xp: number) {
   this.xp += xp;
   this.xpTill += xp;
   while (this.xpTill >= calcXP(this.level)) {
      (this.xpTill -= calcXP(this.level)), this.level++;
   }

   return this.level;
});
const ServerMember = mongoose.model<IServerMember, IServerMemberModel>('server_member', ServerMemberSchema);
export default ServerMember;
