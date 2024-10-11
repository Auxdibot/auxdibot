import { Auxdibot } from '@/Auxdibot';
import { GuildMember, PartialGuildMember } from 'discord.js';
import findOrCreateServer from '../server/findOrCreateServer';

export default async function memberLeave(
   auxdibot: Auxdibot,
   serverID: string,
   member: GuildMember | PartialGuildMember,
) {
   const server = await findOrCreateServer(auxdibot, serverID);
   await auxdibot.database.servermembers
      .update({
         where: { serverID_userID: { userID: member.id, serverID } },
         data: {
            in_server: false,
            xp: undefined,
            sticky_roles: member.roles.cache
               .filter((role) => server && server.sticky_roles.indexOf(role.id) != -1)
               .map((role) => role.id),
         },
      })
      .catch(() => undefined);
   try {
      const user = await auxdibot.database.users.findFirst({
         where: { userID: member.id, premium_servers: { has: serverID } },
      });
      if (user) {
         user.premium_servers.splice(user.premium_servers.indexOf(serverID), 1);
         await auxdibot.database.users.update({
            where: { userID: member.id },
            data: { premium_servers: user.premium_servers },
         });
      }
   } catch (x) {
      return undefined;
   }
}
