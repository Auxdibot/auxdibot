import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { GuildMember } from 'discord.js';

export async function grantLevelRewards(auxdibot: Auxdibot, member: GuildMember, level: number) {
   const server = await findOrCreateServer(auxdibot, member.guild.id);
   const rewards = server.level_rewards.filter((r) => r.level <= level);
   if (rewards.length == 0) return;
   for (const reward of rewards) {
      if (!member.roles.cache.has(reward.roleID))
         await member.roles.add(reward.roleID).catch(() => {
            handleLog(auxdibot, member.guild, {
               date_unix: Date.now(),
               description: `Failed to grant role ${reward.roleID} to ${member.id} at level ${level}. Possibly an error with permissions?`,
               type: LogAction.ERROR,
               userID: member.id,
            });
         });
   }
   return;
}
