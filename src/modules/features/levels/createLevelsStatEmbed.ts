import { Auxdibot } from '@/interfaces/Auxdibot';
import calcXP from '@/util/calcXP';

import { servermembers } from '@prisma/client';
import { EmbedBuilder, User } from 'discord.js';
import { calculateLevel } from './calculateLevel';

export async function createLevelsStatEmbed(auxdibot: Auxdibot, data: servermembers, user: User) {
   const level = calculateLevel(data.xp);

   const xpTill = data.xp - calcXP(level);
   const nextLevelXP = Math.round(calcXP(level + 1)) - calcXP(level);
   let percent = Math.round((xpTill / nextLevelXP) * 10);
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
         }] \`Level ${(
            level + 1
         ).toLocaleString()}\`\n(\`${xpTill.toLocaleString()}\ XP\`/\`${nextLevelXP.toLocaleString()}\ XP\`)`,
      },
   ];
   return embed;
}
