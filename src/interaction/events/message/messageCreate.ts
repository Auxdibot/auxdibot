import { APIEmbed, Message } from 'discord.js';
import parsePlaceholders from '@/util/parsePlaceholder';
import Modules from '@/constants/bot/commands/Modules';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Auxdibot } from '@/interfaces/Auxdibot';
import awardXP from '@/modules/features/levels/awardXP';
import { DEFAULT_LEVELUP_EMBED } from '@/constants/embeds/DefaultEmbeds';
import checkBlacklistedWords from '@/modules/features/moderation/automod/checkBlacklistedWords';
import { cacheMessage } from '@/modules/features/cacheMessage';
import checkMessageSpam from '@/modules/features/moderation/automod/checkMessageSpam';
import checkAttachmentsSpam from '@/modules/features/moderation/automod/checkAttachmentsSpam';
import checkInvitesSpam from '@/modules/features/moderation/automod/checkInvitesSpam';

export default async function messageCreate(auxdibot: Auxdibot, message: Message) {
   if (message.author.bot) return;
   const sender = message.member;
   if (!sender || !message.guild || message.channel.isDMBased()) return;
   const server = await findOrCreateServer(auxdibot, message.guild.id);
   cacheMessage(auxdibot, message);
   /*
   Automod
   */

   if (!server.automod_role_exceptions.some((i) => message.member.roles.cache.has(i))) {
      checkBlacklistedWords(auxdibot, server, message);

      checkMessageSpam(auxdibot, server, message);
      checkAttachmentsSpam(auxdibot, server, message);
      checkInvitesSpam(auxdibot, server, message);
   }

   if (server.message_xp <= 0) return;
   /*
   Leveling
   */
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
                     '{%LEVELUP%}',
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
         } catch (x) {}
         const reward = server.level_rewards.find((reward) => reward.level == newLevel);
         if (reward) {
            const role = message.guild.roles.cache.get(reward.roleID);
            if (role) sender.roles.add(role);
         }
      }
   }
}
