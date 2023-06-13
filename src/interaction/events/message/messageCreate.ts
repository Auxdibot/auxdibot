import { APIEmbed, Message } from 'discord.js';
import parsePlaceholders from '@/util/parsePlaceholder';
import Modules from '@/constants/bot/commands/Modules';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Auxdibot } from '@/interfaces/Auxdibot';
import awardXP from '@/modules/features/levels/awardXP';
import { DEFAULT_LEVELUP_EMBED } from '@/constants/embeds/DefaultEmbeds';

export default async function messageCreate(auxdibot: Auxdibot, message: Message) {
   if (message.author.bot || message.author.id == message.client.user.id) return;
   const sender = message.member;
   if (!sender || !message.guild) return;
   const server = await findOrCreateServer(auxdibot, message.guild.id);
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
            await message.reply({ embeds: [embed as APIEmbed] });
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
