import { Auxdibot } from '@/Auxdibot';
import { Prisma, punishments, PunishmentType } from '@prisma/client';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import Limits from '@/constants/database/Limits';
import { BaseInteraction, ButtonStyle, EmbedBuilder, Guild, User } from 'discord.js';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import { punishmentInfoField } from './punishmentInfoField';

import incrementPunishmentsTotal from './incrementPunishmentsTotal';
import { getServerPunishments } from './getServerPunishments';
import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';

export default async function createPunishment(
   auxdibot: Auxdibot,
   guild: Guild,
   punishment: Prisma.punishmentsCreateInput,
   interaction?: BaseInteraction,
   user?: User,
   duration?: number | 'permanent',
   deleteMessageDays?: number,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   const premium = await auxdibot.fetchPremiumSubscriptionUser(guild.id).catch(() => undefined);
   const punishments = await getServerPunishments(auxdibot, guild.id);
   const appealable = premium && server.appeal_channel && !['WARN', 'DELETE_MESSAGE', 'KICK'].includes(punishment.type);
   if (punishments.find((i) => i.punishmentID == punishment.punishmentID)) return undefined;
   auxdibot.database.analytics
      .upsert({
         where: { botID: auxdibot.user.id },
         create: { botID: auxdibot.user.id },
         update: { punishments: { increment: 1 } },
      })
      .catch(() => undefined);
   const limit = await auxdibot.getLimit(Limits.ACTIVE_PUNISHMENTS_DEFAULT_LIMIT, guild);
   // trim oldest punishments if limit is reached
   if (punishments.length >= limit) {
      // remove all elements past limit
      const sorted = punishments.sort((a, b) => b.punishmentID - a.punishmentID).slice(limit);
      await auxdibot.database.punishments
         .deleteMany({ where: { serverID: guild.id, punishmentID: { in: sorted.map((i) => i.punishmentID) } } })
         .catch(() => undefined);
   }
   if (punishment.reason?.length > 500) throw new Error('Your punishment reason is too long!');
   const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.punishment).toJSON();
   dmEmbed.title = PunishmentValues[punishment.type].name;
   dmEmbed.description = `You were ${PunishmentValues[punishment.type].action} on ${guild ? guild.name : 'Server'}.${
      appealable
         ? `\n\n*You can appeal this punishment by running the command below*\n\`/appeal appeal_id:${guild.id}$${punishment.punishmentID}\``
         : ''
   }`;
   dmEmbed.fields = [punishmentInfoField(punishment, server.punishment_send_moderator, server.punishment_send_reason)];

   const appealButton = appealable
      ? [
           new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                 .setStyle(ButtonStyle.Secondary)
                 .setEmoji({ name: '📝' })
                 .setCustomId(`createappeal-${guild.id}$${punishment.punishmentID}`)
                 .setLabel('Appeal Punishment'),
           ),
        ]
      : [];

   const dmedMessage = await user?.send({ embeds: [dmEmbed], components: appealButton }).catch(() => undefined);
   punishment.dmed = !!dmedMessage;
   switch (punishment.type) {
      case PunishmentType.KICK:
         await guild.members.kick(user, punishment.reason || 'No reason specified.').catch((x) => {
            if (x.code == '50013') {
               dmedMessage?.delete().catch(() => undefined);
               throw new Error('Auxdibot does not have permission to Kick Members!');
            }
         });
         break;
      case PunishmentType.BAN:
         await guild.members
            .ban(user, {
               reason: punishment.reason,
               deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60,
            })
            .catch((x) => {
               if (x.code == '50013') {
                  dmedMessage?.delete().catch(() => undefined);
                  throw new Error('Auxdibot does not have permission to Ban Members!');
               }
            });
         break;
      case PunishmentType.MUTE:
         const role = await guild.roles.fetch(server.mute_role).catch(() => undefined);
         const member = await guild.members.fetch({ user: user.id }).catch(() => undefined);
         if (!member) {
            dmedMessage?.delete().catch(() => undefined);
            throw new Error('Member is not in server!');
         }
         if (role && server.mute_role) {
            await member.roles.add(role).catch((x) => {
               if (x.code == '50013') {
                  dmedMessage?.delete().catch(() => undefined);
                  throw new Error('Auxdibot does not have permission to Manage Roles!');
               }
            });
         } else {
            if (!duration || !Number(duration)) {
               dmedMessage?.delete().catch(() => undefined);
               throw new Error('Permanent punishment date with no mute role!');
            }
            await member.timeout(duration, punishment.reason).catch(() => {
               dmedMessage?.delete().catch(() => undefined);
               throw new Error('Could not mute user, possibly due to lack of permission!');
            });
         }
         break;
   }
   return await auxdibot.database.punishments
      .create({ data: punishment })
      .then(async () => {
         const embed = new EmbedBuilder().setColor(0x9c0e11).toJSON();
         embed.title = PunishmentValues[punishment.type].name;
         embed.description = `User was ${PunishmentValues[punishment.type].action}.`;
         embed.fields = [punishmentInfoField(punishment, true, true)];
         embed.footer = {
            text: `Punishment ID: ${punishment.punishmentID}`,
         };
         await auxdibot.log(
            guild,
            {
               userID: punishment.userID,
               description: `${user?.username || punishment.userID} was ${PunishmentValues[punishment.type].action}.`,
               date: new Date(),
               type: PunishmentValues[punishment.type].log,
            },
            { fields: [punishmentInfoField(punishment, true, true)], user_avatar: true },
         );
         if (interaction) auxdibot.createReply(interaction, { embeds: [embed] });
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
                     const thresholdPunishment = <punishments>{
                        type: server.automod_threshold_punishment,
                        serverID: guild.id,
                        reason: 'You have met the warns threshold for this server.',
                        date: new Date(),
                        dmed: false,
                        expired: false,
                        expires_date: undefined,
                        userID: data.userID,
                        moderatorID: user.id,
                        punishmentID: await incrementPunishmentsTotal(auxdibot, guild.id),
                     };

                     return await auxdibot.database.servermembers
                        .update({
                           where: { serverID_userID: { serverID: guild.id, userID: data.userID } },
                           data: { warns: 0 },
                        })
                        .then(async () => {
                           return await createPunishment(auxdibot, guild, thresholdPunishment, interaction, user).catch(
                              (x) => {
                                 auxdibot.log(
                                    guild,
                                    {
                                       type: 'ERROR',
                                       date: new Date(),
                                       description: `Failed to create punishment for ${user.tag} (${user.id})`,
                                       userID: user.id,
                                    },
                                    { fields: [{ name: 'Error Message', value: x.message, inline: false }] },
                                 );
                              },
                           );
                        });
                  }
               });
         }
         return punishment;
      })
      .catch(() => undefined);
}
