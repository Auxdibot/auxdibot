import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from '@discordjs/builders';
import { TextInputStyle } from 'discord.js';

export const denyModal = (pid: number) =>
   new ModalBuilder()
      .setTitle('Deny Punishment Appeal')
      .setCustomId(`deny-${pid}`)
      .addComponents(
         new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
               .setCustomId('reason')
               .setPlaceholder('The reason given for the denial.')
               .setLabel('What is the deny reason?')
               .setMaxLength(1000)
               .setStyle(TextInputStyle.Paragraph),
         ),
      );
export const acceptModal = (pid: number) =>
   new ModalBuilder()
      .setTitle('Appeal Punishment')
      .setCustomId(`appeal-${pid}`)
      .addComponents(
         new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
               .setCustomId('reason')
               .setPlaceholder('The reason given for the appeal.')
               .setLabel('What is the appeal reason?')
               .setMaxLength(1000)
               .setStyle(TextInputStyle.Paragraph),
         ),
      );
