import { VoiceState } from 'discord.js';
import { Auxdibot } from '@/Auxdibot';

import { LogAction } from '@prisma/client';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import awardXP from '@/modules/features/levels/awardXP';
import { sendLevelMessage } from '@/util/sendLevelMessage';
import { grantLevelRewards } from '@/modules/features/levels/grantLevelRewards';
import { createUserVCSchedule } from '@/modules/features/levels/createUserVCSchedule';
import { calculateLevel } from '@/modules/features/levels/calculateLevel';

export default async function voiceStateUpdate(auxdibot: Auxdibot, oldState: VoiceState, newState: VoiceState) {
   if (!oldState.serverDeaf && newState.serverDeaf) {
      await auxdibot.log(newState.guild, {
         type: LogAction.MEMBER_DEAFENED,
         date: new Date(),
         description: `${newState.member.user.username} was server deafened.`,
         userID: newState.member.user.id,
      });
   }
   if (!oldState.serverMute && newState.serverMute) {
      await auxdibot.log(newState.guild, {
         type: LogAction.MEMBER_MUTED,
         date: new Date(),
         description: `${newState.member.user.username} was server muted.`,
         userID: newState.member.user.id,
      });
   }
   if (oldState.channelId == newState.channelId) return;
   if (newState.member.user.bot) return;
   if (oldState.channelId == null) {
      const guild = newState.guild;

      if (guild) {
         const server = await findOrCreateServer(auxdibot, guild.id);
         try {
            const events = (await guild.scheduledEvents.fetch()).filter(
               (event) =>
                  event.channelId == newState.channelId &&
                  event.isActive() &&
                  !auxdibot.level_events.find((value) => value[0] == newState.member.id && value[1] == event.id),
            );

            const channelMultiplier = server.channel_multipliers.find((i) => i.id == newState.channelId);
            const roleMultiplier =
               server.role_multipliers.length > 0
                  ? server.role_multipliers.reduce(
                       (acc, i) => (newState.member.roles.cache.has(i.id) ? acc * i.multiplier : acc),
                       1,
                    )
                  : 1;
            if (events.size > 0 && !(server.event_xp_range[0] == 0 && !server.event_xp_range[1])) {
               events.forEach((event) => auxdibot.level_events.push([newState.member.id, event.id]));
               const level = await auxdibot.database.servermembers
                  .findFirst({
                     where: { serverID: guild.id, userID: newState.member.id },
                     select: { xp: true },
                  })
                  .then((memberData) => calculateLevel(memberData.xp))
                  .catch(() => undefined);
               const randomValue =
                  server.event_xp_range[0] +
                  (server.event_xp_range[1]
                     ? Math.floor(Math.random() * (server.event_xp_range[1] - server.event_xp_range[0] + 1))
                     : 0);
               const newLevel = await awardXP(
                  auxdibot,
                  guild.id,
                  newState.member.id,
                  randomValue *
                     server.global_multiplier *
                     (channelMultiplier ? channelMultiplier.multiplier : 1) *
                     (roleMultiplier || 1),
               );
               if (newLevel && level && newLevel > level) {
                  await sendLevelMessage(auxdibot, newState.member, level, newLevel, {
                     textChannel: newState.channel,
                  }).catch(() => undefined);
                  await grantLevelRewards(auxdibot, newState.member, newLevel).catch(() => undefined);
               }
            }
         } catch (x) {
            auxdibot.log(guild, {
               type: LogAction.ERROR,
               date: new Date(),
               description: `An unknown error ocurred attempting to award event XP to the member ${newState.member.user.username}. Please contact support if this issue persists.`,
               userID: newState.member.user.id,
            });
         }
         try {
            if (!(server.voice_xp_range[0] == 0 && !server.voice_xp_range[1]))
               createUserVCSchedule(auxdibot, newState.member);
         } catch (x) {
            auxdibot.log(guild, {
               type: LogAction.ERROR,
               date: new Date(),
               description: `An unknown error ocurred attempting to award voice channel XP to the member ${newState.member.user.username}. Please contact support if this issue persists.`,
               userID: newState.member.user.id,
            });
         }
      }
   }
}
