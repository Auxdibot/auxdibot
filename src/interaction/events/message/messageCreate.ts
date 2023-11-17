import { APIEmbed, Message } from 'discord.js';
import parsePlaceholders from '@/util/parsePlaceholder';
import Modules from '@/constants/bot/commands/Modules';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Auxdibot } from '@/interfaces/Auxdibot';
import awardXP from '@/modules/features/levels/awardXP';
import { DEFAULT_LEVELUP_EMBED } from '@/constants/embeds/DefaultEmbeds';
import { Punishment } from '@prisma/client';
import createPunishment from '@/modules/features/moderation/createPunishment';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import checkBlacklistedWords from '@/modules/features/moderation/checkBlacklistedWords';

export default async function messageCreate(auxdibot: Auxdibot, message: Message) {
   if (message.author.bot) return;
   const sender = message.member;
   if (!sender || !message.guild || message.channel.isDMBased()) return;
   const server = await findOrCreateServer(auxdibot, message.guild.id);
   checkBlacklistedWords(auxdibot, server, message);
   if (!auxdibot.messages.find((i) => i.message == message.id)) {
      auxdibot.messages.set(BigInt(Date.now()), {
         message: message.id,
         channel: message.channelId,
         author: message.author.id,
         attachments: message.attachments.size > 0,
         invites: message.content.includes('discord.gg/' || 'discordapp.com/invite/' || 'discord.com/invite/'),
      });
   }
   if (server.automod_spam_limit?.duration && server.automod_spam_punishment?.punishment) {
      const previousMessages = auxdibot.messages.filter(
         (_i, sent) =>
            sent > BigInt(Date.now() - server.automod_spam_limit.duration) &&
            !auxdibot.spam_detections.find((i) => i.has(sent)),
      );
      if (previousMessages.size > server.automod_spam_limit.messages) {
         const punishment = <Punishment>{
            punishmentID: await incrementPunishmentsTotal(auxdibot, server.serverID),
            type: server.automod_spam_punishment.punishment,
            date_unix: Date.now(),
            reason: server.automod_spam_punishment.reason || 'You have exceeded the spam limit for this server!',
            userID: sender.id,
            expired: false,
            moderatorID: '',
            dmed: false,
         };
         auxdibot.spam_detections.set([message.guildId, BigInt(Date.now())], previousMessages);
         await createPunishment(auxdibot, message.guild, punishment, undefined, sender.user);
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
