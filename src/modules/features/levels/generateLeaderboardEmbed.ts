import { CustomEmojis } from '@/constants/bot/CustomEmojis';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild } from 'discord.js';
import generateLevelLeaderboard from './generateLevelLeaderboard';
import { generateLeaderboardCount } from './generateLeaderboardCount';
import { calculateLevel } from './calculateLevel';

const TROPHIES = ['🏆', '🥈', '🥉'];

export async function generateLeaderboardEmbed(auxdibot: Auxdibot, guild: Guild, start = 0, limit = 20) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   const leaderboard = await generateLevelLeaderboard(auxdibot, server.serverID, limit, start);
   const embed = new EmbedBuilder().setColor(auxdibot.colors.levels).toJSON();
   const total = await generateLeaderboardCount(auxdibot, guild);
   embed.title = `${CustomEmojis.LEVELS} Levels Leaderboard`;
   let placement = start;

   embed.description = leaderboard.reduce((acc, member) => {
      placement++;

      return (
         acc +
         `**${placement <= 3 ? `${TROPHIES[placement - 1]} ${placement}` : placement}**) <@${
            member.userID
         }> - \`Level ${calculateLevel(member.xp)}\` (\`${member.xp} XP\`)\n`
      );
   }, '');
   const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('leaderboard-start').setEmoji('⏮️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
         .setCustomId(`leaderboard-prev-${start}`)
         .setEmoji('⬅️')
         .setStyle(ButtonStyle.Secondary)
         .setDisabled(start - 20 < 0),
      new ButtonBuilder()
         .setCustomId('dummy')
         .setEmoji(CustomEmojis.LEVELS)
         .setLabel(`Page ${Math.ceil(start / 20) + 1} / ${Math.ceil(total / 20)}`)
         .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
         .setCustomId(`leaderboard-next-${start}`)
         .setEmoji('➡️')
         .setStyle(ButtonStyle.Secondary)
         .setDisabled(start + 20 > total),
      new ButtonBuilder().setCustomId(`leaderboard-end`).setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
   );
   return { embed, row };
}
