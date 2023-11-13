import { APIEmbed, EmbedBuilder, Message } from 'discord.js';
import parsePlaceholders from '@/util/parsePlaceholder';
import Modules from '@/constants/bot/commands/Modules';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Auxdibot } from '@/interfaces/Auxdibot';
import awardXP from '@/modules/features/levels/awardXP';
import { DEFAULT_LEVELUP_EMBED } from '@/constants/embeds/DefaultEmbeds';
import { LogAction, Punishment, PunishmentType } from '@prisma/client';
import handleLog from '@/util/handleLog';
import createPunishment from '@/modules/features/moderation/createPunishment';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';

export default async function messageCreate(auxdibot: Auxdibot, message: Message) {
   if (message.author.bot) return;
   const sender = message.member;
   if (!sender || !message.guild || message.channel.isDMBased()) return;
   const server = await findOrCreateServer(auxdibot, message.guild.id);
   if (server.automod_banned_phrases.length > 0 && server.automod_banned_phrases_punishment) {
      for (const blacklist of server.automod_banned_phrases) {
         if (message.content.toUpperCase().includes(blacklist.toUpperCase())) {
            if (server.automod_banned_phrases_punishment == PunishmentType.DELETE_MESSAGE) {
               const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.punishment).toJSON();
               dmEmbed.title = '🗑️ Message Deleted';
               dmEmbed.description = `Your message was deleted on ${
                  message.guild ? message.guild.name : 'Server'
               } for including the blacklisted phrase "${blacklist}"`;
               dmEmbed.fields = [
                  {
                     name: 'Deleted Message',
                     value: `Deleted Content: \n\`\`\`${message.cleanContent}\`\`\``,
                     inline: false,
                  },
               ];
               message.delete().then(async () => {
                  await sender
                     .send({ embeds: [dmEmbed] })
                     .then(() => true)
                     .catch(() => false);
                  await handleLog(
                     auxdibot,
                     message.guild,
                     {
                        type: LogAction.MESSAGE_DELETED_AUTOMOD,
                        userID: sender.id,
                        date_unix: Date.now(),
                        description: `A message was deleted in ${
                           !message.channel.isDMBased() ? message.channel.name : 'a channel'
                        } because it included the blacklisted phrase "${blacklist}"`,
                     },
                     [
                        {
                           name: 'Deleted Message',
                           value: `Deleted Content: \n\`\`\`${message.cleanContent}\`\`\``,
                           inline: false,
                        },
                     ],
                  );
               });
            } else {
               const punishment = <Punishment>{
                  punishmentID: await incrementPunishmentsTotal(auxdibot, server.serverID),
                  type: server.automod_banned_phrases_punishment,
                  date_unix: Date.now(),
                  reason: `Usage of blacklisted phrase "${blacklist}"`,
                  userID: sender.id,
                  expired: false,
                  moderatorID: '',
                  dmed: false,
               };
               const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.punishment).toJSON();
               dmEmbed.title = `${PunishmentValues[server.automod_banned_phrases_punishment].name}`;
               dmEmbed.description = `You were ${
                  PunishmentValues[server.automod_banned_phrases_punishment].action
               } on ${message.guild ? message.guild.name : 'Server'}.`;
               dmEmbed.fields = [punishmentInfoField(punishment)];
               punishment.dmed = await sender
                  .send({ embeds: [dmEmbed] })
                  .then(() => true)
                  .catch(() => false);
               message
                  .delete()
                  .then(async () => {
                     await handleLog(
                        auxdibot,
                        message.guild,
                        {
                           type: LogAction.MESSAGE_DELETED_AUTOMOD,
                           userID: sender.id,
                           date_unix: Date.now(),
                           description: `A message was deleted in ${
                              !message.channel.isDMBased() ? message.channel.name : 'a channel'
                           } because it included the blacklisted phrase "${blacklist}" (user was ${
                              PunishmentValues[server.automod_banned_phrases_punishment].action
                           })`,
                        },
                        [
                           {
                              name: 'Deleted Message',
                              value: `Deleted Content: \n\`\`\`${message.cleanContent}\`\`\``,
                              inline: false,
                           },
                        ],
                     );
                     await createPunishment(auxdibot, message.guild, punishment, undefined, sender.user);
                  })
                  .catch(() => undefined);
            }
         }
      }
   }
   if (server.message_xp <= 0) return;
   if (!server.disabled_modules.find((item) => item == Modules['Levels'].name)) {
      const level = await auxdibot.database.servermembers
         .findFirst({
            where: { serverID: message.guild.id, userID: message.member.id },
         })
         .then((memberData) => memberData.level)
         .catch(() => undefined);
      const newLevel = await awardXP(auxdibot, message.guild.id, message.member.id, server.message_xp);
      if (newLevel && level && newLevel > level) {
         try {
            if (!message.guild || !message.member) return;
            if (server.level_embed) {
               const embed = JSON.parse(
                  (
                     await parsePlaceholders(
                        auxdibot,
                        JSON.stringify(DEFAULT_LEVELUP_EMBED),
                        message.guild,
                        message.member,
                     )
                  ).replaceAll(
                     '%levelup%',
                     ` \`Level ${level.toLocaleString()}\` -> \`Level ${newLevel.toLocaleString()}\` `,
                  ),
               );
               if (server.level_channel) {
                  const channel = message.guild.channels.cache.get(server.level_channel);
                  if (channel && channel.isTextBased())
                     await channel.send({ content: `${message.author}`, embeds: [embed as APIEmbed] });
               } else {
                  await message.reply({ embeds: [embed as APIEmbed] });
               }
            }
         } catch (x) {
            console.log(x);
         }
         const reward = server.level_rewards.find((reward) => reward.level == newLevel);
         if (reward) {
            const role = message.guild.roles.cache.get(reward.roleID);
            if (role) sender.roles.add(role);
         }
      }
   }
}
