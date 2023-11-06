import { VoiceState } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';

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
}
