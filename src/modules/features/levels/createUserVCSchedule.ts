import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildMember } from 'discord.js';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';
import awardXP from './awardXP';
import { sendLevelMessage } from '@/util/sendLevelMessage';
import { grantLevelRewards } from './grantLevelRewards';
import { calculateLevel } from './calculateLevel';

export function createUserVCSchedule(auxdibot: Auxdibot, member: GuildMember) {
   const task = new AsyncTask(member.id + ' vclevels', async (taskId) => {
      member = await member.fetch().catch(() => undefined);
      const server = await auxdibot.database.servers
         .findFirst({ where: { serverID: member.guild.id } })
         .catch(() => undefined);
      if (
         !member ||
         !server ||
         (server.voice_xp_range[0] == 0 && !server.voice_xp_range[1]) ||
         member.voice.channelId === null
      ) {
         auxdibot.scheduler.removeById(taskId);
         return;
      }
      const level = await auxdibot.database.servermembers
         .findFirst({
            where: { serverID: member.guild.id, userID: member.user.id },
            select: { xp: true },
         })
         .then((memberData) => calculateLevel(memberData.xp))
         .catch(() => undefined);
      const randomValue =
         server.voice_xp_range[0] +
         (server.voice_xp_range[1]
            ? Math.floor(Math.random() * (server.voice_xp_range[1] - server.voice_xp_range[0] + 1))
            : 0);
      const channelMultiplier = server.channel_multipliers.find((i) => i.id == member.voice.channelId);
      const roleMultiplier =
         server.role_multipliers.length > 0
            ? server.role_multipliers.reduce((acc, i) => (member.roles.cache.has(i.id) ? acc * i.multiplier : acc), 1)
            : 1;
      const newLevel = await awardXP(
         auxdibot,
         member.guild.id,
         member.user.id,
         randomValue *
            (channelMultiplier ? channelMultiplier.multiplier : 1) *
            (roleMultiplier || 1) *
            server.global_multiplier,
      );

      if (newLevel && level && newLevel > level) {
         await sendLevelMessage(auxdibot, member, level, newLevel, {
            textChannel: member.voice.channel,
         }).catch(() => undefined);
         await grantLevelRewards(auxdibot, member, newLevel).catch(() => undefined);
      }
   });
   auxdibot.scheduler.addSimpleIntervalJob(new SimpleIntervalJob({ minutes: 1 }, task, {}));
}
