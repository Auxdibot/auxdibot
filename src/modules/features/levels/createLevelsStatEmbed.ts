import { Auxdibot } from '@/interfaces/Auxdibot';
import calcXP from '@/util/calcXP';

import { servermembers } from '@prisma/client';
import { EmbedBuilder, User } from 'discord.js';
import { calculateLevel } from './calculateLevel';

export async function createLevelsStatEmbed(auxdibot: Auxdibot, data: servermembers, user: User) {
   const level = calculateLevel(data.xp);

   let percent = Math.round((data.xp / calcXP(level + 1) || 0) * 10);
   const xpTill = data.xp - calcXP(level);
   if (!isFinite(percent)) percent = 0;
   const avatar = user?.avatarURL({ size: 128 });

   const embed = new EmbedBuilder().setColor(auxdibot.colors.levels).toJSON();
   embed.title = `${user ? user.username + "'s" : 'Your'} Level`;

   if (avatar) embed.thumbnail = { url: avatar };
   embed.description = `🏅 Experience: \`${data.xp.toLocaleString()} XP\`\n🏆 Level: \`Level ${level.toLocaleString()}\``;
   embed.fields = [
      {
         name: 'Level Progress',
         value: `\`Level ${level.toLocaleString()}\` [${
            new Array(percent + 1).join('🟩') + new Array(10 - percent).join('⬛')
         }] \`Level ${(level + 1).toLocaleString()}\`\n(\`${xpTill.toLocaleString()}\ XP\`/\`${calcXP(
            level + 1,
         ).toLocaleString()}\ XP\`)`,
      },
   ];
   return embed;
}
