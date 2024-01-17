import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { APIRole, Guild, Role, User } from 'discord.js';

export default async function removeJoinRole(
   auxdibot: Auxdibot,
   guild: Guild,
   role?: Role | APIRole,
   roleID?: string,
   user?: User | Express.User,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (!server.join_roles.find((val: string) => (role != null && val == role?.id) || (roleID && val == roleID)))
      throw new Error(`You do not have ${role.name} added as a join role!`);
   if (role && guild.members.me.roles.highest.position < role.position)
      throw new Error("This role is higher than Auxdibot's highest role!");

   server.join_roles.splice(server.join_roles.indexOf(role?.id ?? roleID), 1);

   return await auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { join_roles: server.join_roles },
         select: { join_roles: true },
      })
      .then(async (data) => {
         if (user)
            await handleLog(auxdibot, guild, {
               userID: user.id,
               description: `Removed ${role?.name || `<@&${roleID}>`} from the join roles.`,
               type: LogAction.JOIN_ROLE_REMOVED,
               date_unix: Date.now(),
            });
         return data;
      })
      .catch(() => {
         throw new Error("Couldn't add that join role to your server!");
      });
}
