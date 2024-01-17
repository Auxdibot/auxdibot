import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { APIRole, Guild, Role } from 'discord.js';

export default async function removeStickyRole(auxdibot: Auxdibot, guild: Guild, role: Role | APIRole) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (!server.sticky_roles.find((val: string) => role != null && val == role.id))
      throw new Error(`You do not have ${role.name} added as a sticky role!`);
   if (guild.members.me.roles.highest.position < role.position)
      throw new Error("This role is higher than Auxdibot's highest role!");

   server.sticky_roles.splice(server.sticky_roles.indexOf(role.id), 1);

   return await auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { sticky_roles: server.sticky_roles },
      })
      .then((data) => data)
      .catch(() => {
         throw new Error("Couldn't add that sticky role to your server!");
      });
}
