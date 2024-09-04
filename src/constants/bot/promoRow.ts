import { ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { CustomEmojis } from './CustomEmojis';

export const promoRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
   new ButtonBuilder()
      .setStyle(5)
      .setLabel('Invite')
      .setEmoji(CustomEmojis.INVITE)
      .setURL(process.env.DISCORD_INVITE_LINK ?? process.env.BOT_HOMEPAGE ?? 'https://auxdibot.xyz'),
   new ButtonBuilder()
      .setStyle(5)
      .setLabel('Website')
      .setEmoji(CustomEmojis.LINK)
      .setURL(process.env.BOT_HOMEPAGE ?? 'https://auxdibot.xyz'),
   new ButtonBuilder()
      .setStyle(5)
      .setLabel('Documentation')
      .setEmoji(CustomEmojis.DOCS)
      .setURL(process.env.DOCS_HOMEPAGE ?? 'https://docs.auxdibot.xyz'),
   new ButtonBuilder()
      .setStyle(5)
      .setLabel('Support Server')
      .setEmoji(CustomEmojis.AUXDIBOT)
      .setURL('https://discord.gg/tnsFW9CQEn'),
);
