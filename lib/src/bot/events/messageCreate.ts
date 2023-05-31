import { APIEmbed, Message } from 'discord.js';
import Server from '@/mongo/model/server/Server';
import parsePlaceholders from '@/util/parsePlaceholder';
import Modules from '@/config/Modules';

module.exports = {
   name: 'messageCreate',
   once: false,
   async execute(message: Message) {
      if (message.author.bot || message.author.id == message.client.user.id) return;
      const sender = message.member;
      if (!sender || !message.guild) return;
      const server = await Server.findOrCreateServer(message.guild.id);
      const settings = await server.fetchSettings();
      if (settings.message_xp <= 0) return;
      const member = await server.findOrCreateMember(sender.id);
      if (!member) return;
      if (!settings.disabled_modules.find((item) => item == Modules['Levels'].name)) {
         const level = member.level;
         const newLevel = member.addXP(settings.message_xp);
         await member.save({ validateModifiedOnly: true });
         if (newLevel > level) {
            try {
               if (!message.guild || !message.member) return;
               const embed = JSON.parse(
                  (
                     await parsePlaceholders(JSON.stringify(settings.levelup_embed), message.guild, message.member)
                  ).replaceAll(
                     '%levelup%',
                     ` \`Level ${level.toLocaleString()}\` -> \`Level ${newLevel.toLocaleString()}\` `,
                  ),
               );
               await message.reply({ embeds: [embed as APIEmbed] });
            } catch (x) {
               console.log(x);
            }
            const reward = settings.level_rewards.find((reward) => reward.level == newLevel);
            if (reward) {
               const role = message.guild.roles.cache.get(reward.role_id);
               if (role) sender.roles.add(role);
            }
         }
      }
   },
};
