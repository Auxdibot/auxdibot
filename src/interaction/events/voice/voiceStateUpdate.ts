import { VoiceState } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import awardXP from '@/modules/features/levels/awardXP';
import { sendLevelMessage } from '@/util/sendLevelMessage';

export default async function voiceStateUpdate(auxdibot: Auxdibot, oldState: VoiceState, newState: VoiceState) {
   if (!oldState.serverDeaf && newState.serverDeaf) {
      await handleLog(auxdibot, newState.guild, {
         type: LogAction.MEMBER_DEAFENED,
         date_unix: Date.now(),
         description: `${newState.member.user.username} was server deafened.`,
         userID: newState.member.user.id,
      });
   }
   if (!oldState.serverMute && newState.serverMute) {
      await handleLog(auxdibot, newState.guild, {
         type: LogAction.MEMBER_MUTED,
         date_unix: Date.now(),
         description: `${newState.member.user.username} was server muted.`,
         userID: newState.member.user.id,
      });
   }
   if (oldState.channelId == newState.channelId) return;
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
            const multiplier = server.channel_multipliers.find((i) => i.id == newState.channelId);
            if (events.size > 0 && server.level_event_xp > 0) {
               events.forEach((event) => auxdibot.level_events.push([newState.member.id, event.id]));
               const level = await auxdibot.database.servermembers
                  .findFirst({
                     where: { serverID: guild.id, userID: newState.member.id },
                     select: { level: true },
                  })
                  .then((memberData) => memberData.level)
                  .catch(() => undefined);
               const newLevel = await awardXP(
                  auxdibot,
                  guild.id,
                  newState.member.id,
                  server.level_event_xp * events.size * (multiplier ? multiplier.multiplier : 1),
               );
               if (newLevel && level && newLevel > level) {
                  await sendLevelMessage(auxdibot, newState.member, level, newLevel, {
                     textChannel: newState.channel,
                  }).catch(() => undefined);
               }
            }
         } catch (x) {
            handleLog(auxdibot, guild, {
               type: LogAction.ERROR,
               date_unix: Date.now(),
               description: `An unknown error ocurred attempting to award event XP to the member ${newState.member.user.username}. Please contact support if this issue persists.`,
               userID: newState.member.user.id,
            });
         }
      }
   }
}
