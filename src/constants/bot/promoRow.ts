import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CustomEmojis } from './CustomEmojis';
import { Auxdibot } from '@/Auxdibot';

export const promoRow = async (auxdibot: Auxdibot, userID?: string) => {
   const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
         .setStyle(5)
         .setLabel('Invite')
         .setEmoji(CustomEmojis.INVITE)
         .setURL(process.env.DISCORD_INVITE_LINK ?? process.env.BOT_HOMEPAGE ?? 'https://bot.auxdible.me'),
      new ButtonBuilder()
         .setStyle(5)
         .setLabel('Website')
         .setEmoji(CustomEmojis.LINK)
         .setURL(process.env.BOT_HOMEPAGE ?? 'https://bot.auxdible.me'),
      new ButtonBuilder()
         .setStyle(5)
         .setLabel('Support Server')
         .setEmoji(CustomEmojis.AUXDIBOT)
         .setURL('https://discord.gg/tnsFW9CQEn'),
   );
   if (userID && !(await auxdibot.hasVoted(userID))) {
      row.addComponents(
         new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel('Vote for Auxdibot')
            .setEmoji(CustomEmojis.PREMIUM)
            .setURL(process.env.TOPGG_VOTE_URL ?? 'https://top.gg/bot/776496457867591711/vote'),
      );
   }
   return row;
};
