import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

import { LogAction } from '@prisma/client';
import { GuildMember } from 'discord.js';
import deleteLevelReward from './deleteLevelReward';

export async function grantLevelRewards(auxdibot: Auxdibot, member: GuildMember, level: number) {
   const server = await findOrCreateServer(auxdibot, member.guild.id);
   const rewards = server.level_rewards.filter((r) => r.level <= level);
   if (rewards.length == 0) return;
   for (const reward of rewards) {
      if (!member.roles.cache.has(reward.roleID))
         await member.roles.add(reward.roleID).catch(async () => {
            const roleCheck = await member.guild.roles.fetch(reward.roleID).catch(() => undefined);
            if (!roleCheck) {
               deleteLevelReward(
                  auxdibot,
                  member.guild,
                  auxdibot.user,
                  server.level_rewards.findIndex((i) => i.roleID == reward.roleID),
               ).catch(() => undefined);
            } else {
               auxdibot.log(member.guild, {
                  date: new Date(),
                  description: `Failed to grant role ${reward.roleID} to ${member.id} at level ${level}. Possibly an error with permissions?`,
                  type: LogAction.ERROR,
                  userID: member.id,
               });
            }
         });
   }
   return;
}
