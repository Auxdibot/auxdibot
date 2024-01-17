import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import { LogAction } from '@prisma/client';
import { APIRole, Guild, Role, User } from 'discord.js';

export default async function addJoinRole(
   auxdibot: Auxdibot,
   guild: Guild,
   role: Role | APIRole,
   user?: User | Express.User,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (role.id == guild.roles.everyone.id)
      throw new Error('Uh, I think everyone who joins the server already gets the everyone role, silly.');
   if (server.join_roles.find((val: string) => role != null && val == role.id))
      throw new Error(`You already have ${role.name} added as a join role!`);
   if (guild.members.me.roles.highest.position <= role.position)
      throw new Error("This role is higher than Auxdibot's highest role!");
   if (!testLimit(server.join_roles, Limits.JOIN_ROLE_DEFAULT_LIMIT))
      throw new Error('You have too many existing join roles!');
   return auxdibot.database.servers
      .update({ where: { serverID: guild.id }, data: { join_roles: { push: role.id } }, select: { join_roles: true } })
      .then(async (data) => {
         if (user)
            await handleLog(auxdibot, guild, {
               userID: user.id,
               description: `Added ${role.name} to the join roles.`,
               type: LogAction.JOIN_ROLE_ADDED,
               date_unix: Date.now(),
            });
         return data;
      })
      .catch(() => {
         throw new Error("Couldn't add that join role to your server!");
      });
}
