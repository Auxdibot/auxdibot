import { Auxdibot } from '@/Auxdibot';

import { LogAction } from '@prisma/client';
import { APIRole, Guild, Role } from 'discord.js';

export default async function massroleMembers(
   auxdibot: Auxdibot,
   guild: Guild,
   role: Role | APIRole,
   give: boolean,
   user?: { id: string },
) {
   const members = await guild.members.fetch().catch(() => undefined);
   if (!members) return 0;
   members.forEach((member) => {
      if (
         user.id != member.id &&
         (!member.roles.resolve(role.id) &&
            guild.members.me &&
            member.roles.highest.comparePositionTo(guild.members.me.roles.highest) <= 0 &&
            member.roles.highest.comparePositionTo(member.roles.highest)) <= 0
      ) {
         give ? member.roles.add(role.id).catch(() => undefined) : member.roles.remove(role.id).catch(() => undefined);
      }
   });
   auxdibot.log(guild, {
      userID: user.id,
      description: give
         ? `Massrole gave ${role.name} to anyone with lower role hiearchy than Auxdibot.`
         : `Massrole took ${role.name} from anyone who had it, with lower role hiearchy than Auxdibot.`,
      type: give ? LogAction.MASSROLE_GIVEN : LogAction.MASSROLE_TAKEN,
      date: new Date(),
   });
   return members.size;
}
