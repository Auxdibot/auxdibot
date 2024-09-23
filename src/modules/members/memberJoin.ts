import { Auxdibot } from '@/Auxdibot';
import { GuildMember, PartialGuildMember } from 'discord.js';

export default async function memberJoin(
   auxdibot: Auxdibot,
   serverID: string,
   member: GuildMember | PartialGuildMember,
) {
   if (member.user.bot) return;
   const memberData = await auxdibot.database.servermembers.upsert({
      where: { serverID_userID: { userID: member.id, serverID } },
      update: { in_server: true },
      create: { userID: member.id, serverID: serverID },
   });
   if (memberData.sticky_roles) {
      memberData.sticky_roles.forEach(async (role: string) => member.roles.add(role).catch(() => undefined));
      await auxdibot.database.servermembers.update({
         where: { serverID_userID: { serverID, userID: member.id } },
         data: { sticky_roles: [] },
      });
   }
}
