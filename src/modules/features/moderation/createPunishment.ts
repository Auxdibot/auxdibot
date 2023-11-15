import { Auxdibot } from '@/interfaces/Auxdibot';
import { Punishment, PunishmentType } from '@prisma/client';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { testLimit } from '@/util/testLimit';
import Limits from '@/constants/database/Limits';
import { BaseInteraction, EmbedBuilder, Guild, User } from 'discord.js';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import { punishmentInfoField } from './punishmentInfoField';
import handleLog from '@/util/handleLog';
import incrementPunishmentsTotal from './incrementPunishmentsTotal';

export default async function createPunishment(
   auxdibot: Auxdibot,
   guild: Guild,
   punishment: Punishment,
   interaction?: BaseInteraction,
   user?: User,
   duration?: number | 'permanent',
   deleteMessageDays?: number,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (server.punishments.find((i) => i.punishmentID == punishment.punishmentID)) return undefined;
   if (testLimit(server.punishments, Limits.ACTIVE_PUNISHMENTS_DEFAULT_LIMIT, true) == 'spliced') {
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { punishments: server.punishments },
      });
   }
   switch (punishment.type) {
      case PunishmentType.KICK:
         await guild.members.kick(user, punishment.reason || 'No reason specified.');
         break;
      case PunishmentType.BAN:
         await guild.members.ban(user, {
            reason: punishment.reason,
            deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60,
         });
         break;
      case PunishmentType.MUTE:
         const role = await guild.roles.fetch(server.mute_role).catch(() => undefined);
         const member = await guild.members.fetch({ user: user.id }).catch(() => undefined);
         if (!member) {
            throw new Error('Member is not in server!');
         }
         if (role && server.mute_role) {
            await member.roles.add(role);
         } else {
            if (!duration || !Number(duration)) {
               throw new Error('Permanent punishment date with no mute role!');
            }
            await member.timeout(duration, punishment.reason);
         }
         break;
   }
   return await auxdibot.database.servers
      .update({ where: { serverID: guild.id }, data: { punishments: { push: punishment } } })
      .then(async () => {
         const embed = new EmbedBuilder().setColor(0x9c0e11).toJSON();
         embed.title = PunishmentValues[punishment.type].name;
         embed.description = `User was ${PunishmentValues[punishment.type].action}.`;
         embed.fields = [punishmentInfoField(punishment)];
         embed.footer = {
            text: `Punishment ID: ${punishment.punishmentID}`,
         };
         await handleLog(
            auxdibot,
            guild,
            {
               userID: punishment.userID,
               description: `${user?.username || punishment.userID} was ${PunishmentValues[punishment.type].action}.`,
               date_unix: Date.now(),
               type: PunishmentValues[punishment.type].log,
            },
            [punishmentInfoField(punishment)],
            true,
         );
         if (interaction && interaction.isRepliable()) interaction.reply({ embeds: [embed] });
         if (punishment.type == PunishmentType.WARN) {
            await auxdibot.database.servermembers
               .update({
                  where: { serverID_userID: { serverID: guild.id, userID: user.id } },
                  data: { warns: { increment: 1 } },
               })
               .then(async (data) => {
                  if (!data.warns) {
                     await auxdibot.database.servermembers.update({
                        where: { serverID_userID: { serverID: guild.id, userID: user.id } },
                        data: { warns: 1 },
                     });
                     data.warns = 1;
                  }
                  if (
                     data.warns >= server.automod_punish_threshold_warns &&
                     server.automod_punish_threshold_warns > 0
                  ) {
                     const thresholdPunishment = <Punishment>{
                        type: server.automod_threshold_punishment,
                        reason: 'You have met the warns threshold for this server.',
                        date_unix: Date.now(),
                        dmed: false,
                        expired: false,
                        expires_date_unix: undefined,
                        userID: data.userID,
                        moderatorID: user.id,
                        punishmentID: await incrementPunishmentsTotal(auxdibot, guild.id),
                     };
                     const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.punishment).toJSON();
                     dmEmbed.title = PunishmentValues[server.automod_threshold_punishment].name;
                     dmEmbed.description = `You were ${
                        PunishmentValues[server.automod_threshold_punishment].action
                     } on ${guild ? guild.name : 'Server'}.`;
                     dmEmbed.fields = [punishmentInfoField(thresholdPunishment)];
                     thresholdPunishment.dmed = await user
                        .send({ embeds: [dmEmbed] })
                        .then(() => true)
                        .catch(() => false);
                     return await auxdibot.database.servermembers
                        .update({
                           where: { serverID_userID: { serverID: guild.id, userID: data.userID } },
                           data: { warns: 0 },
                        })
                        .then(async () => {
                           return await createPunishment(auxdibot, guild, thresholdPunishment, interaction, user);
                        });
                  }
               });
         }
         return punishment;
      })
      .catch(() => undefined);
}
