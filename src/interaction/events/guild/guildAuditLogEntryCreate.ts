import { Auxdibot } from '@/Auxdibot';
import createPunishment from '@/modules/features/moderation/createPunishment';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import { LogAction, PunishmentType } from '@prisma/client';
import {
   AuditLogEvent,
   Guild,
   GuildAuditLogsActionType,
   GuildAuditLogsEntry,
   GuildAuditLogsTargetType,
} from 'discord.js';

export async function guildAuditLogEntryCreate(
   auxdibot: Auxdibot,
   entry: GuildAuditLogsEntry<AuditLogEvent, GuildAuditLogsActionType, GuildAuditLogsTargetType, AuditLogEvent>,
   guild: Guild,
) {
   const { action } = entry;
   if (
      (action == AuditLogEvent.MemberKick || action == AuditLogEvent.MemberBanAdd) &&
      entry.executorId != auxdibot.user.id
   ) {
      const { targetId, executorId } = entry;
      const punishments = await getServerPunishments(auxdibot, guild.id, {
         date: { gt: new Date(Date.now() - 5000), lt: new Date(Date.now() + 5000) },
         userID: targetId,
      });
      if (!punishments) {
         const user = await auxdibot.users.fetch(targetId).catch(() => undefined);
         createPunishment(
            auxdibot,
            guild,
            {
               date: new Date(),
               userID: targetId,
               type: action == AuditLogEvent.MemberKick ? PunishmentType.KICK : PunishmentType.BAN,
               dmed: false,
               reason: entry.reason || 'No reason provided.',
               expired: false,
               expires_date: null,
               moderatorID: executorId,
               serverID: guild.id,
               punishmentID: await incrementPunishmentsTotal(auxdibot, guild.id),
            },
            null,
            user,
            'permanent',
         ).catch((x) => {
            auxdibot.log(
               guild,
               {
                  type: LogAction.ERROR,
                  date: new Date(),
                  description: `Failed to create punishment for ${user?.tag ?? targetId} (${targetId})`,
                  userID: user?.id ?? targetId,
               },
               {
                  fields: [{ name: 'Error Message', value: x.message, inline: false }],
               },
            );
         });
      }
   }
}
