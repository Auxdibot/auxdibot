import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { APIRole, Guild, Role } from 'discord.js';

export default async function removeJoinRole(auxdibot: Auxdibot, guild: Guild, role: Role | APIRole) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (!server.join_roles.find((val: string) => role != null && val == role.id))
      throw new Error(`You do not have ${role.name} added as a join role!`);
   if (guild.members.me.roles.highest.position < role.position)
      throw new Error("This role is higher than Auxdibot's highest role!");

   server.join_roles.splice(server.join_roles.indexOf(role.id), 1);

   return await auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { join_roles: server.join_roles },
      })
      .then((data) => data)
      .catch(() => {
         throw new Error("Couldn't add that join role to your server!");
      });
}
