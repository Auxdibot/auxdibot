import { Message } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Auxdibot } from '@/Auxdibot';
import awardXP from '@/modules/features/levels/awardXP';
import checkBlacklistedWords from '@/modules/features/moderation/automod/checkBlacklistedWords';
import checkMessageSpam from '@/modules/features/moderation/automod/checkMessageSpam';
import checkAttachmentsSpam from '@/modules/features/moderation/automod/checkAttachmentsSpam';
import checkInvitesSpam from '@/modules/features/moderation/automod/checkInvitesSpam';
import { sendLevelMessage } from '@/util/sendLevelMessage';
import { grantLevelRewards } from '@/modules/features/levels/grantLevelRewards';
import { calculateLevel } from '@/modules/features/levels/calculateLevel';

export default async function messageCreate(auxdibot: Auxdibot, message: Message) {
   if (message.author.bot) return;
   const sender = message.member;
   if (!sender || !message.guild || message.channel.isDMBased()) return;
   const server = await findOrCreateServer(auxdibot, message.guild.id);
   /*
   Automod
   */

   if (!server.automod_role_exceptions.some((i) => message.member.roles.cache.has(i))) {
      checkBlacklistedWords(auxdibot, server, message);

      checkMessageSpam(auxdibot, message.guild, server, message);
      checkAttachmentsSpam(auxdibot, message.guild, server, message);
      checkInvitesSpam(auxdibot, message.guild, server, message);
   }

   if (server.message_xp_range[0] <= 0 && server.message_xp_range.length <= 1) return;
   if (message.member.user.bot) return;
   /*
   Leveling
   */
   if (!server.disabled_modules.find((item) => item == Modules['Levels'].name)) {
      const level = await auxdibot.database.servermembers
         .findFirst({
            where: { serverID: message.guild.id, userID: message.member.id },
            select: { xp: true },
         })
         .then((memberData) => calculateLevel(memberData.xp))
         .catch(() => undefined);
      const channelMultiplier = server.channel_multipliers.find((i) => i.id == message.channel.id);
      const roleMultiplier =
         server.role_multipliers.length > 0
            ? server.role_multipliers.reduce(
                 (acc, i) => (message.member.roles.cache.has(i.id) ? acc * i.multiplier : acc),
                 1,
              )
            : 1;
      const randomValue =
         server.message_xp_range[0] +
         (server.message_xp_range[1]
            ? Math.floor(Math.random() * (server.message_xp_range[1] - server.message_xp_range[0] + 1))
            : 0);

      const newLevel = await awardXP(
         auxdibot,
         message.guild.id,
         message.member.id,
         randomValue *
            (channelMultiplier ? channelMultiplier.multiplier : 1) *
            (roleMultiplier || 1) *
            server.global_multiplier,
      );
      if (newLevel && level && newLevel > level) {
         if (!message.member) return;

         await sendLevelMessage(auxdibot, message.member, level, newLevel, {
            message: message,
            textChannel: message.channel,
         }).catch(() => undefined);
         await grantLevelRewards(auxdibot, message.member, newLevel).catch(() => undefined);
      }
   }
}
