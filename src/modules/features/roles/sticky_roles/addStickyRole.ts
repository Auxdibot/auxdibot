import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { testLimit } from '@/util/testLimit';
import { APIRole, Guild, Role } from 'discord.js';

export default async function addStickyRole(auxdibot: Auxdibot, guild: Guild, role: Role | APIRole) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (role.id == guild.roles.everyone.id)
      throw new Error('Uh, I think everyone who joins the server already gets the everyone role, silly.');
   if (server.sticky_roles.find((val: string) => role != null && val == role.id))
      throw new Error(`You already have ${role.name} added as a sticky role!`);
   if (guild.members.me.roles.highest.position <= role.position)
      throw new Error("This role is higher than Auxdibot's highest role!");
   if (!testLimit(server.sticky_roles, Limits.STICKY_ROLE_DEFAULT_LIMIT))
      throw new Error('You have too many existing sticky roles!');
   return auxdibot.database.servers
      .update({ where: { serverID: guild.id }, data: { sticky_roles: { push: role.id } } })
      .then((data) => data)
      .catch(() => {
         throw new Error("Couldn't add that sticky role to your server!");
      });
}
