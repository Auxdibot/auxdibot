import { Auxdibot } from '@/Auxdibot';
import createPunishment from '@/modules/features/moderation/createPunishment';
import expireAllPunishments from '@/modules/features/moderation/expireAllPunishments';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

import { LogAction, PunishmentType } from '@prisma/client';
import { AuditLogEvent, GuildMember, PartialGuildMember } from 'discord.js';

export async function guildMemberUpdate(
   auxdibot: Auxdibot,
   oldMember: GuildMember | PartialGuildMember,
   newMember: GuildMember,
) {
   const server = await findOrCreateServer(auxdibot, newMember.guild.id);
   if (
      oldMember.communicationDisabledUntilTimestamp == undefined &&
      newMember.communicationDisabledUntilTimestamp &&
      !server.mute_role
   ) {
      if (newMember.communicationDisabledUntilTimestamp) {
         const logs = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberUpdate, limit: 1 });
         if (
            logs.entries.first() &&
            logs.entries.first().targetId === newMember.id &&
            logs.entries.first().createdTimestamp > Date.now() - 5000 &&
            logs.entries.first().executorId !== auxdibot.user.id
         ) {
            createPunishment(
               auxdibot,
               newMember.guild,
               {
                  date: new Date(),
                  userID: newMember.id,
                  type: PunishmentType.MUTE,
                  dmed: false,
                  reason: logs.entries.first().reason || 'No reason provided.',
                  expired: false,
                  expires_date: new Date(newMember.communicationDisabledUntilTimestamp),
                  moderatorID: logs.entries.first().executorId,
                  serverID: newMember.guild.id,
                  punishmentID: await incrementPunishmentsTotal(auxdibot, newMember.guild.id),
               },
               undefined,
               newMember.user,
               newMember.communicationDisabledUntilTimestamp - Date.now(),
            ).catch((x) => {
               auxdibot.log(
                  newMember.guild,
                  {
                     type: LogAction.ERROR,
                     date: new Date(),
                     description: `Failed to create punishment for ${newMember.user.tag} (${newMember.id})`,
                     userID: newMember.id,
                  },
                  {
                     fields: [{ name: 'Error Message', value: x.message, inline: false }],
                  },
               );
            });
         }
      }
   } else if (
      !server.mute_role &&
      oldMember.communicationDisabledUntilTimestamp &&
      !newMember.communicationDisabledUntilTimestamp
   ) {
      const mutedPunishments = await getServerPunishments(auxdibot, newMember.guild.id, {
         userID: newMember.id,
         type: PunishmentType.MUTE,
         expired: false,
      });

      if (mutedPunishments.length == 0) return;
      expireAllPunishments(auxdibot, newMember.guild, 'MUTE', newMember.user).catch(() => undefined);
   }
}
