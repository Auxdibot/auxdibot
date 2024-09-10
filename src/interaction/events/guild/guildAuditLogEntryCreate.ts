import { Auxdibot } from '@/interfaces/Auxdibot';
import createPunishment from '@/modules/features/moderation/createPunishment';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { PunishmentType } from '@prisma/client';
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
   const server = await findOrCreateServer(auxdibot, guild.id);
   const { action } = entry;
   if (action == AuditLogEvent.MemberKick || action == AuditLogEvent.MemberBanAdd) {
      const { targetId, executorId } = entry;
      const punishment = server.punishments.find(
         (i) => i.userID == targetId && i.date.valueOf() < Date.now() + 5000 && i.date.valueOf() > Date.now() - 5000,
      );
      if (!punishment) {
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
               punishmentID: await incrementPunishmentsTotal(auxdibot, guild.id),
               old_date_unix: null,
               old_expires_date_unix: null,
            },
            null,
            user,
            'permanent',
         );
      }
   }
}
