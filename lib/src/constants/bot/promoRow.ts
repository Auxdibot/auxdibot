import { ActionRowBuilder, ButtonBuilder } from 'discord.js';

export const promoRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
   new ButtonBuilder()
      .setStyle(5)
      .setLabel('Invite')
      .setEmoji('📩')
      .setURL(process.env.DISCORD_INVITE_LINK || 'https://bot.auxdible.me'),
   new ButtonBuilder().setStyle(5).setLabel('Website').setEmoji('🖥️').setURL('https://bot.auxdible.me'),
);
