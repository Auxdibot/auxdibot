import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { APIRole, Guild, Role, User } from 'discord.js';

export default async function removeStickyRole(
   auxdibot: Auxdibot,
   guild: Guild,
   role?: Role | APIRole,
   roleID?: string,
   user?: User | Express.User,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (!server.sticky_roles.find((val: string) => (role != null && val == role?.id) || (roleID && val == roleID)))
      throw new Error(`You do not have ${role.name} added as a sticky role!`);
   if (guild.members.me.roles.highest.position < role.position)
      throw new Error("This role is higher than Auxdibot's highest role!");

   server.sticky_roles.splice(server.sticky_roles.indexOf(role?.id ?? roleID), 1);

   return await auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { sticky_roles: server.sticky_roles },
         select: { sticky_roles: true },
      })
      .then(async (data) => {
         if (user)
            await handleLog(auxdibot, guild, {
               userID: user.id,
               description: `Removed role ${role?.name ?? `<@&${roleID}>`} from the sticky roles.`,
               type: LogAction.STICKY_ROLE_REMOVED,
               date: new Date(),
            });
         return data;
      })
      .catch(() => {
         throw new Error("Couldn't add that sticky role to your server!");
      });
}
