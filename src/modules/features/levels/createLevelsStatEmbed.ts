import { Auxdibot } from '@/interfaces/Auxdibot';
import calcXP from '@/util/calcXP';

import { servermembers } from '@prisma/client';
import { EmbedBuilder, User } from 'discord.js';

export async function createLevelsStatEmbed(auxdibot: Auxdibot, data: servermembers, user: User) {
   const levelXP = calcXP(data.level);
   let percent = Math.round((data.xpTill / levelXP || 0) * 10);
   if (!isFinite(percent)) percent = 0;
   const avatar = user?.avatarURL({ size: 128 });

   const embed = new EmbedBuilder().setColor(auxdibot.colors.levels).toJSON();
   embed.title = `${user ? user.username + "'s" : 'Your'} Level`;
   if (avatar) embed.thumbnail = { url: avatar };
   embed.description = `🏅 Experience: \`${data.xp.toLocaleString()} XP\`\n🏆 Level: \`Level ${data.level.toLocaleString()}\``;
   embed.fields = [
      {
         name: 'Level Progress',
         value: `\`Level ${data.level.toLocaleString()}\` [${
            new Array(percent + 1).join('🟩') + new Array(10 - percent).join('⬛')
         }] \`Level ${(
            data.level + 1
         ).toLocaleString()}\`\n(\`${data.xpTill.toLocaleString()}\ XP\`/\`${levelXP.toLocaleString()}\ XP\`)`,
      },
   ];
   return embed;
}
