import { Auxdibot } from '@/interfaces/Auxdibot';
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
            level: undefined,
            xpTill: undefined,
            sticky_roles: member.roles.cache
               .filter((role) => server && server.sticky_roles.indexOf(role.id) != -1)
               .map((role) => role.id),
         },
      })
      .catch(() => undefined);
}
