import { Auxdibot } from '@/interfaces/Auxdibot';
import createPunishment from '@/modules/features/moderation/createPunishment';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { LogAction, PunishmentType } from '@prisma/client';
import { AuditLogEvent, EmbedBuilder, GuildMember, PartialGuildMember } from 'discord.js';

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
            logs.entries.first().targetId === newMember.id &&
            logs.entries.first().createdTimestamp > Date.now() - 5000
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
                  punishmentID: await incrementPunishmentsTotal(auxdibot, newMember.guild.id),
                  old_date_unix: null,
                  old_expires_date_unix: null,
               },
               undefined,
               newMember.user,
               newMember.communicationDisabledUntilTimestamp - Date.now(),
            );
         }
      }
   } else if (!server.mute_role) {
      const muted = server.punishments.find(
         (p) => p.userID == newMember.id && p.type == PunishmentType.MUTE && !p.expired,
      );
      if (!muted) return;
      muted.expired = true;
      await auxdibot.database.servers
         .update({
            where: { serverID: newMember.guild.id },
            data: { punishments: server.punishments },
         })
         .then(async () => {
            handleLog(
               auxdibot,
               newMember.guild,
               {
                  userID: newMember.id,
                  description: `${newMember.user.username} was unmuted.`,
                  date: new Date(),
                  type: LogAction.UNMUTE,
               },
               [punishmentInfoField(muted, true, true)],
               true,
            );
            const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            dmEmbed.title = '🔊 Unmuted';
            dmEmbed.description = `You were unmuted on ${newMember.guild.name}.`;
            dmEmbed.fields = [punishmentInfoField(muted, true, true)];
            await newMember.user.send({ embeds: [dmEmbed] }).catch(() => undefined);
         })
         .catch(() => undefined);
   }
}
