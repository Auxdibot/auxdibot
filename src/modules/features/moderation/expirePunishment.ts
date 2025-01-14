import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import canExecute from '@/util/canExecute';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction, punishments } from '@prisma/client';
import { BaseInteraction, Guild } from 'discord.js';
import { punishmentInfoField } from './punishmentInfoField';

export async function expirePunishment(
   auxdibot: Auxdibot,
   guild: Guild,
   punishment: punishments,
   interaction?: BaseInteraction,
) {
   if (!['MUTE', 'BAN'].includes(punishment.type)) return;
   const member = guild.members.resolve(punishment.userID);
   const user = await auxdibot.users.fetch(punishment.userID).catch(() => undefined);
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (member) {
      const executor = interaction ? guild.members.resolve(interaction.member.user.id) : undefined;
      if (executor && !canExecute(guild, executor, member)) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await auxdibot.createReply(interaction, { embeds: [noPermissionEmbed] });
      }
      if (punishment.type == 'MUTE') {
         if (server.mute_role) {
            member.roles.remove(interaction.guild.roles.resolve(server.mute_role) || '').catch(() => undefined);
         } else {
            member.timeout(null, 'Unmuted').catch(() => undefined);
         }
      } else {
         interaction.guild.bans.remove(punishment.userID).catch(() => undefined);
      }
   }
   let newPunishment = await auxdibot.database.punishments.update({
      where: { serverID_punishmentID: { serverID: guild.id, punishmentID: punishment.punishmentID }, expired: false },
      data: { expired: true },
   });

   if (newPunishment.appeal && !newPunishment.appeal.accepted) {
      newPunishment = await auxdibot.database.punishments.update({
         where: { serverID_punishmentID: { serverID: guild.id, punishmentID: punishment.punishmentID } },
         data: { appeal: null },
      });
   }
   if (!newPunishment) return;
   const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
   dmEmbed.title = punishment.type == 'MUTE' ? '🔊 Unmuted' : '📥 Unbanned';
   dmEmbed.description = `You were unmuted on ${interaction.guild.name}.`;
   dmEmbed.fields = [punishmentInfoField(newPunishment, true, true)];
   await user?.send({ embeds: [dmEmbed] }).catch(() => undefined);

   await auxdibot.log(
      interaction.guild,
      {
         userID: user.id,
         description: `${user.username} was ${punishment.type == 'MUTE' ? 'unmuted' : 'unbanned'}.`,
         date: new Date(),
         type: punishment.type == 'MUTE' ? LogAction.UNMUTE : LogAction.UNBAN,
      },
      { fields: [punishmentInfoField(newPunishment, true, true)], user_avatar: true },
   );
}
